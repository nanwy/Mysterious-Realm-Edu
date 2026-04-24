import { createApiClient, unwrapEnvelope } from "@workspace/api";
import type {
  ScoreDetailRecord,
  ScoreDetailsFiltersState,
  ScoreDetailsResult,
  ScoreFiltersState,
  ScoreListResult,
  ScoreRecord,
} from "./types";
import {
  toBooleanOrNull,
  toNumberOrNull,
  toRecordOrEmpty,
  toText,
} from "@/lib/normalize";

interface ListResponse {
  records?: unknown[];
  list?: unknown[];
  rows?: unknown[];
  total?: number;
  count?: number;
  totalCount?: number;
}

const client = createApiClient({
  getToken: () =>
    typeof window === "undefined" ? null : window.localStorage.getItem("token"),
});

const toListPayload = (payload: unknown) => {
  if (Array.isArray(payload)) {
    return { records: payload, total: payload.length };
  }

  const record = toRecordOrEmpty(payload) as ListResponse;
  const records = Array.isArray(record.records)
    ? record.records
    : Array.isArray(record.list)
      ? record.list
      : Array.isArray(record.rows)
        ? record.rows
        : [];
  const total =
    toNumberOrNull(record.total ?? record.count ?? record.totalCount) ??
    records.length;

  return { records, total };
};

export const normalizeScoreRecord = (
  item: unknown,
  index: number
): ScoreRecord => {
  const record = toRecordOrEmpty(item);
  const identifier =
    record.id ??
    record.userExamId ??
    record.examId ??
    `score-record-${index + 1}`;

  return {
    id: String(identifier),
    examId: toText(record.examId ?? record.id),
    examTitle: toText(
      record.examTitle ?? record.title ?? record.examName,
      `考试 ${index + 1}`
    ),
    tryCount: toNumberOrNull(record.tryCount ?? record.examCount),
    maxScore: toNumberOrNull(record.maxScore ?? record.score ?? record.userScore),
    passed: toBooleanOrNull(record.passed),
    recentExamTime: toText(
      record.updateTime ?? record.examTime ?? record.createTime
    ),
  };
};

export const normalizeScoreDetailRecord = (
  item: unknown,
  index: number
): ScoreDetailRecord => {
  const record = toRecordOrEmpty(item);
  const identifier =
    record.id ?? record.userExamId ?? `score-detail-${index + 1}`;

  return {
    id: String(identifier),
    examTitle: toText(record.examTitle ?? record.title, `考试记录 ${index + 1}`),
    createTime: toText(record.createTime ?? record.examTime),
    commitTime: toText(record.commitTime ?? record.submitTime),
    userTime: toText(record.userTime ?? record.useTime),
    userScore: toText(record.userScore ?? record.score),
    qualifyScore: toText(record.qualifyScore ?? record.passScore),
    stateLabel: toText(
      record.state_dictText ?? record.stateText ?? record.state,
      "待同步"
    ),
    passed: toBooleanOrNull(record.passed),
  };
};

export const normalizeScoreError = (error: unknown) => {
  const message =
    error instanceof Error && error.message
      ? error.message
      : "成绩接口暂时不可用，请稍后重试。";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message} 未检测到 NEXT_PUBLIC_API_BASE_URL。`;
  }

  if (message === "网络请求失败") {
    return "成绩接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
};

export const fetchScores = async (
  filters: ScoreFiltersState
): Promise<ScoreListResult> => {
  const response = await client.post<ListResponse>("/exam/userExamResult/list", {
    examTitle: filters.examTitle,
    passed: filters.passed,
    pageNo: filters.pageNo,
    pageSize: filters.pageSize,
  });
  const payload = toListPayload(unwrapEnvelope(response));

  return {
    records: payload.records.map(normalizeScoreRecord),
    total: payload.total,
  };
};

export const fetchScoreDetails = async (
  examId: string,
  filters: ScoreDetailsFiltersState
): Promise<ScoreDetailsResult> => {
  const response = await client.post<ListResponse>("/exam/userExamDetail/list", {
    examId,
    passed: filters.passed,
    pageNo: filters.pageNo,
    pageSize: filters.pageSize,
  });
  const payload = toListPayload(unwrapEnvelope(response));

  return {
    records: payload.records.map(normalizeScoreDetailRecord),
    total: payload.total,
  };
};

