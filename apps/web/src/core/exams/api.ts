import { api, unwrapEnvelope } from "@workspace/api";
import {
  EXAM_STATUS,
  EXAM_STATUS_OPTIONS,
  EXAM_TYPE,
  EXAM_TYPE_OPTIONS,
} from "./config";
import type { ExamResolvedStatus, ExamTypeFilter } from "./config";
import type {
  ExamFiltersState,
  ExamListItem,
  ExamListResult,
  ExamPreview,
} from "./types";
import {
  toBooleanOrNull,
  toDate,
  toNumberOrNull,
  toRecordOrEmpty,
  toText,
} from "@/lib/normalize";

interface ListPayload {
  records: Array<Record<string, unknown>>;
  total: number;
}

const formatShortDate = (date: Date | null) => {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatDate = (value: unknown) => {
  if (!value) {
    return "待公布";
  }

  const rawDate =
    typeof value === "number" && Number.isFinite(value)
      ? new Date(value > 1e12 ? value : value * 1000)
      : new Date(String(value));

  if (Number.isNaN(rawDate.getTime())) {
    return "待公布";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(rawDate);
};

const toListPayload = (value: unknown): ListPayload => {
  if (Array.isArray(value)) {
    return {
      records: value.map(toRecordOrEmpty),
      total: value.length,
    };
  }

  const payload = toRecordOrEmpty(value);
  const records = Array.isArray(payload.records)
    ? payload.records.map(toRecordOrEmpty)
    : Array.isArray(payload.list)
      ? payload.list.map(toRecordOrEmpty)
      : Array.isArray(payload.rows)
        ? payload.rows.map(toRecordOrEmpty)
        : Array.isArray(payload.data)
          ? payload.data.map(toRecordOrEmpty)
          : [];

  const totalValue =
    payload.total ??
    payload.count ??
    payload.totalCount ??
    payload.recordTotal ??
    records.length;
  const total = toNumberOrNull(totalValue) ?? records.length;

  return { records, total };
};

const getExamTypeLabel = (value: ExamTypeFilter) =>
  EXAM_TYPE_OPTIONS.find((item) => item.value === value)?.label ?? "公开考试";

const getExamStatusLabel = (value: ExamResolvedStatus) =>
  EXAM_STATUS_OPTIONS.find((item) => item.value === value)?.label ?? "进行中";

const isResolvedExamStatus = (value: string): value is ExamResolvedStatus =>
  value === EXAM_STATUS.IN_PROGRESS ||
  value === EXAM_STATUS.NOT_STARTED ||
  value === EXAM_STATUS.ENDED;

const resolveStatus = (
  record: Record<string, unknown>
): ExamResolvedStatus => {
  const raw = toText(record.state ?? record.status ?? record.examStatus);
  if (isResolvedExamStatus(raw)) {
    return raw;
  }

  const now = Date.now();
  const startAt = toDate(
    record.startTime ?? record.beginTime ?? record.examStartTime
  );
  const endAt = toDate(
    record.endTime ?? record.finishTime ?? record.examEndTime
  );

  if (startAt && now < startAt.getTime()) {
    return EXAM_STATUS.NOT_STARTED;
  }

  if (endAt && now > endAt.getTime()) {
    return EXAM_STATUS.ENDED;
  }

  return EXAM_STATUS.IN_PROGRESS;
};

const buildTimeText = (record: Record<string, unknown>) => {
  const directText = toText(record.examTime ?? record.timeRange);
  if (directText) {
    return directText;
  }

  const startAt = toDate(
    record.startTime ?? record.beginTime ?? record.examStartTime
  );
  const endAt = toDate(
    record.endTime ?? record.finishTime ?? record.examEndTime
  );
  const startText = formatShortDate(startAt);
  const endText = formatShortDate(endAt);

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
};

const buildSummary = (
  record: Record<string, unknown>,
  statusLabel: string
) => {
  const summary = toText(
    record.examDesc ??
      record.description ??
      record.remark ??
      record.introduction
  );
  if (summary) {
    return summary;
  }

  const duration = toText(
    record.examDuration ?? record.duration ?? record.limitTime
  );
  if (duration) {
    return `当前状态：${statusLabel}，考试时长 ${duration}。`;
  }

  return `当前状态：${statusLabel}，请在开放时间内进入考试。`;
};

const buildAttendeeText = (record: Record<string, unknown>) => {
  const attendeeCount = toText(
    record.examNumber ?? record.joinNum ?? record.applyCount ?? record.userCount
  );
  return attendeeCount ? `${attendeeCount} 人参与` : "参与人数待更新";
};

const buildActionLabel = (status: ExamResolvedStatus) => {
  if (status === EXAM_STATUS.NOT_STARTED) {
    return "查看安排";
  }

  if (status === EXAM_STATUS.ENDED) {
    return "查看结果";
  }

  return "进入考试";
};

const toExamListItem = (
  item: Record<string, unknown>,
  index: number
): ExamListItem => {
  const rawExamType = toText(
    item.examType ?? item.type,
    EXAM_TYPE.PUBLIC
  );
  const examType: ExamTypeFilter =
    rawExamType === EXAM_TYPE.MINE ? EXAM_TYPE.MINE : EXAM_TYPE.PUBLIC;
  const status = resolveStatus(item);
  const statusLabel = getExamStatusLabel(status);
  const title = toText(
    item.examName ?? item.title ?? item.name,
    `考试 ${index + 1}`
  );
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
};

const toCountText = (value: unknown, suffix: string, fallback = "--") => {
  const normalized = toText(value);
  return normalized ? `${normalized}${suffix}` : fallback;
};

const resolvePreviewState = (record: Record<string, unknown>) => {
  const raw = toText(
    record.state ?? record.status ?? record.examStatus,
    EXAM_STATUS.IN_PROGRESS
  );
  if (isResolvedExamStatus(raw)) {
    return raw;
  }

  return EXAM_STATUS.IN_PROGRESS;
};

const buildInstructions = (record: Record<string, unknown>) => {
  const paper = toRecordOrEmpty(record.paper);
  const questionCount = toText(paper.questionCount, "--");
  const joinType = toText(paper.joinType_dictText, "固定组卷");
  const totalScore = toText(paper.totalScore, "--");
  const qualifyScore = toText(record.qualifyScore, "--");
  const totalTime = toText(
    record.totalTime ?? record.examDuration ?? record.duration,
    "--"
  );
  const limitCount = toNumberOrNull(record.limitCount);
  const leaveOn = toBooleanOrNull(record.leaveOn);
  const leaveTimes = toText(record.totalLeaveTimes, "--");
  const snapOn = toBooleanOrNull(record.snapOn);
  const snapInterval = toText(record.snapIntervalTime, "--");

  const instructions = [
    "点击开始考试后将进入正式作答流程，请在稳定网络环境下完成考试。",
    `本场考试共 ${questionCount} 题，采用${joinType}，总分 ${totalScore} 分，${qualifyScore} 分及格。`,
    `考试时长 ${totalTime} 分钟${
      limitCount && limitCount > 0
        ? `，每位考生最多可参加 ${limitCount} 次。`
        : "。"
    }${leaveOn ? ` 切屏超过 ${leaveTimes} 次将触发自动交卷。` : ""}`,
  ];

  if (snapOn) {
    instructions.push(
      `进入考试后系统会每隔 ${snapInterval} 分钟抓拍一次作答照片。`
    );
  }

  return instructions;
};

const buildStartState = (
  record: Record<string, unknown>,
  reachedLimit: boolean
) => {
  const state = resolvePreviewState(record);
  const paper = toRecordOrEmpty(record.paper);
  const hasPaper = Object.keys(paper).length > 0;

  if (!hasPaper) {
    return {
      startDisabled: true,
      startLabel: "暂不可开始",
      startHint: "当前考试缺少试卷信息，无法安全进入考试。",
    };
  }

  if (state === EXAM_STATUS.NOT_STARTED) {
    return {
      startDisabled: true,
      startLabel: "暂未开始",
      startHint: "考试尚未开放，请在开始时间后重新进入。",
    };
  }

  if (state === EXAM_STATUS.ENDED) {
    return {
      startDisabled: true,
      startLabel: "考试已结束",
      startHint: "本场考试已结束，不能再从预览页进入作答。",
    };
  }

  if (reachedLimit) {
    return {
      startDisabled: true,
      startLabel: "已达限考次数",
      startHint: "你已达到本场考试的限考次数，当前不能继续开始。",
    };
  }

  return {
    startDisabled: false,
    startLabel: "开始考试",
    startHint:
      "在线作答页尚在迁移中，当前版本先保留入口与说明，点击后会给出明确提示。",
  };
};

const toExamPreview = (
  examId: string,
  payload: unknown,
  options: { hasRecord: boolean; reachedLimit: boolean }
): ExamPreview | null => {
  const record = toRecordOrEmpty(payload);
  const resolvedId = toText(record.id ?? record.examId, examId);
  const title = toText(record.title ?? record.examName ?? record.name);

  if (!resolvedId || !title) {
    return null;
  }

  const paper = toRecordOrEmpty(record.paper);
  const startState = buildStartState(record, options.reachedLimit);
  const description = toText(
    record.description ??
      record.examDesc ??
      record.remark ??
      record.introduction,
    "请在考试开始前仔细阅读考试说明、时长要求与作答约束。"
  );

  return {
    id: resolvedId,
    title,
    summary: toText(paper.title, "考试预览"),
    description,
    schedule: [
      {
        label: "开始时间",
        value: formatDate(
          record.startTime ?? record.beginTime ?? record.examStartTime
        ),
      },
      {
        label: "截止时间",
        value: formatDate(
          record.endTime ?? record.finishTime ?? record.examEndTime
        ),
      },
      { label: "开放权限", value: toText(record.openType_dictText, "全部学员") },
    ],
    stats: [
      {
        label: "考试时长",
        value: toCountText(
          record.totalTime ?? record.examDuration ?? record.duration,
          " 分钟"
        ),
      },
      { label: "总分", value: toCountText(paper.totalScore, " 分") },
      { label: "及格分", value: toCountText(record.qualifyScore, " 分") },
      { label: "题目数量", value: toCountText(paper.questionCount, " 题") },
      { label: "限考次数", value: toCountText(record.limitCount, " 次") },
      { label: "已考次数", value: toCountText(record.tryCount, " 次", "0 次") },
      { label: "考试记录", value: options.hasRecord ? "已存在记录" : "首次进入" },
      { label: "试卷名称", value: toText(paper.title, "待同步") },
    ],
    instructions: buildInstructions(record),
    ...startState,
  };
};

export const fetchExamList = async (
  filters: ExamFiltersState
): Promise<ExamListResult> => {
  try {
    const response = await api.exam.listExams({ ...filters });
    const payload = toListPayload(unwrapEnvelope(response));

    return {
      items: payload.records.map(toExamListItem),
      total: payload.total,
    };
  } catch {
    return { items: [], total: 0 };
  }
};

export const fetchExamPreview = async (
  examId: string
): Promise<ExamPreview | null> => {
  try {
    const [detailResult, recordResult, limitResult] = await Promise.allSettled([
      api.exam.queryExamById({ id: examId }),
      api.exam.examRecordExists({ examId }),
      api.exam.checkExamLimit({ examId }),
    ]);

    if (detailResult.status === "rejected") {
      return null;
    }

    const detail = unwrapEnvelope(detailResult.value);
    const hasRecord =
      recordResult.status === "fulfilled"
        ? Boolean(unwrapEnvelope(recordResult.value))
        : false;
    const reachedLimit =
      limitResult.status === "fulfilled"
        ? Boolean(unwrapEnvelope(limitResult.value))
        : false;

    return toExamPreview(examId, detail, { hasRecord, reachedLimit });
  } catch {
    return null;
  }
};
