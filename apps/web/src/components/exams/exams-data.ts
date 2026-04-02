import { getExamList, unwrapEnvelope } from "@workspace/api";
import {
  EXAM_STATUS_OPTIONS,
  EXAM_TYPE_OPTIONS,
  type ExamFiltersState,
  type ExamListItem,
  type ExamListResult,
  type ExamStatusFilter,
  type ExamTypeFilter,
} from "./exams-types";

interface ListPayload {
  records: Array<Record<string, unknown>>;
  total: number;
}

function toRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function toText(value: unknown, fallback = "") {
  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function toDate(value: unknown) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    const normalized = value > 1e12 ? value : value * 1000;
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof value === "string" && value.trim()) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function formatDate(date: Date | null) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toListPayload(value: unknown): ListPayload {
  if (Array.isArray(value)) {
    return {
      records: value.map(toRecord),
      total: value.length,
    };
  }

  const payload = toRecord(value);
  const records = Array.isArray(payload.records)
    ? payload.records.map(toRecord)
    : Array.isArray(payload.list)
      ? payload.list.map(toRecord)
      : Array.isArray(payload.rows)
        ? payload.rows.map(toRecord)
        : Array.isArray(payload.data)
          ? payload.data.map(toRecord)
          : [];

  const totalValue =
    payload.total ?? payload.count ?? payload.totalCount ?? payload.recordTotal ?? records.length;
  const total = toNumber(totalValue) ?? records.length;

  return { records, total };
}

function getExamTypeLabel(value: ExamTypeFilter) {
  return EXAM_TYPE_OPTIONS.find((item) => item.value === value)?.label ?? "公开考试";
}

function getExamStatusLabel(value: Exclude<ExamStatusFilter, "">) {
  return EXAM_STATUS_OPTIONS.find((item) => item.value === value)?.label ?? "进行中";
}

function resolveStatus(record: Record<string, unknown>): Exclude<ExamStatusFilter, ""> {
  const raw = toText(record.state ?? record.status ?? record.examStatus);
  if (raw === "0" || raw === "2" || raw === "3") {
    return raw;
  }

  const now = Date.now();
  const startAt = toDate(record.startTime ?? record.beginTime ?? record.examStartTime);
  const endAt = toDate(record.endTime ?? record.finishTime ?? record.examEndTime);

  if (startAt && now < startAt.getTime()) {
    return "2";
  }

  if (endAt && now > endAt.getTime()) {
    return "3";
  }

  return "0";
}

function buildTimeText(record: Record<string, unknown>) {
  const directText = toText(record.examTime ?? record.timeRange);
  if (directText) {
    return directText;
  }

  const startAt = toDate(record.startTime ?? record.beginTime ?? record.examStartTime);
  const endAt = toDate(record.endTime ?? record.finishTime ?? record.examEndTime);
  const startText = formatDate(startAt);
  const endText = formatDate(endAt);

  if (startText && endText) {
    return `${startText} - ${endText}`;
  }

  if (startText) {
    return `开始时间 ${startText}`;
  }

  if (endText) {
    return `结束时间 ${endText}`;
  }

  return "考试时间待公布";
}

function buildSummary(record: Record<string, unknown>, statusLabel: string) {
  const summary = toText(
    record.examDesc ?? record.description ?? record.remark ?? record.introduction
  );
  if (summary) {
    return summary;
  }

  const duration = toText(record.examDuration ?? record.duration ?? record.limitTime);
  if (duration) {
    return `当前状态：${statusLabel}，考试时长 ${duration}。`;
  }

  return `当前状态：${statusLabel}，请在开放时间内进入考试。`;
}

function buildAttendeeText(record: Record<string, unknown>) {
  const attendeeCount = toText(
    record.examNumber ?? record.joinNum ?? record.applyCount ?? record.userCount
  );
  return attendeeCount ? `${attendeeCount} 人参与` : "参与人数待更新";
}

function buildActionLabel(status: Exclude<ExamStatusFilter, "">) {
  if (status === "2") {
    return "查看安排";
  }

  if (status === "3") {
    return "查看结果";
  }

  return "进入考试";
}

function normalizeExamRecord(item: Record<string, unknown>, index: number): ExamListItem {
  const examType = (toText(item.examType ?? item.type, "1") === "2" ? "2" : "1") as ExamTypeFilter;
  const status = resolveStatus(item);
  const statusLabel = getExamStatusLabel(status);
  const title = toText(item.examName ?? item.title ?? item.name, `考试 ${index + 1}`);
  const examId = toText(item.examId ?? item.id ?? item.userExamId);

  return {
    id: toText(item.id ?? item.examId ?? item.userExamId, `${title}-${index}`),
    examId,
    title,
    summary: buildSummary(item, statusLabel),
    timeText: buildTimeText(item),
    status,
    statusLabel,
    typeLabel: getExamTypeLabel(examType),
    attendeeText: buildAttendeeText(item),
    actionLabel: buildActionLabel(status),
  };
}

export function normalizeExamError(error: unknown) {
  const message = error instanceof Error && error.message ? error.message : "考试列表加载失败";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，当前仅展示错误态，不能宣称考试接口已打通。`;
  }

  if (message === "网络请求失败") {
    return "考试列表接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
}

export async function fetchExamList(filters: ExamFiltersState): Promise<ExamListResult> {
  const response = await getExamList(filters);
  const payload = toListPayload(unwrapEnvelope(response));

  return {
    items: payload.records.map(normalizeExamRecord),
    total: payload.total,
  };
}
