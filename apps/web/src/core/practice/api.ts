import {
  getRecentPractice,
  getRepositoryById,
  getRepositoryList,
  unwrapEnvelope,
} from "@workspace/api";
import {
  PRACTICE_FREE_ACTIONS,
  PRACTICE_PAGE_SIZE,
  PRACTICE_QUESTION_TYPES,
} from "./config";
import type {
  PracticeModeOverview,
  PracticeModeResult,
  PracticeQueryState,
  PracticeQuestionType,
  PracticeRecentRecord,
  PracticeRepositoryItem,
  PracticeRepositoryResult,
} from "./types";
import {
  toNumberOrFallback,
  toNumberOrNull,
  toRecordOrEmpty,
  toText,
} from "@/lib/normalize";

interface ListPayload {
  records?: unknown[];
  list?: unknown[];
  rows?: unknown[];
  data?: unknown[];
  total?: unknown;
  count?: unknown;
  totalCount?: unknown;
}

const toListPayload = (value: unknown) => {
  if (Array.isArray(value)) {
    return {
      records: value.map(toRecordOrEmpty),
      total: value.length,
    };
  }

  const record = toRecordOrEmpty(value) as ListPayload;
  const records = Array.isArray(record.records)
    ? record.records.map(toRecordOrEmpty)
    : Array.isArray(record.list)
      ? record.list.map(toRecordOrEmpty)
      : Array.isArray(record.rows)
        ? record.rows.map(toRecordOrEmpty)
        : Array.isArray(record.data)
          ? record.data.map(toRecordOrEmpty)
          : [];
  const total =
    toNumberOrNull(record.total ?? record.count ?? record.totalCount) ??
    records.length;

  return { records, total };
};

export const normalizeRepository = (
  item: Record<string, unknown>,
  index: number
): PracticeRepositoryItem => ({
  id: toText(item.id ?? item.repositoryId ?? item.idString, `practice-${index + 1}`),
  title: toText(
    item.repositoryName ?? item.title ?? item.name,
    `题库 ${index + 1}`
  ),
  description: toText(
    item.description ?? item.remark ?? item.summary ?? item.repositoryIntro,
    "暂无题库说明，进入后可查看题目与练习模式。"
  ),
  questionCount:
    item.questionCount ?? item.questionNum ?? item.totalCount
      ? toText(item.questionCount ?? item.questionNum ?? item.totalCount, "")
      : undefined,
  updatedAt:
    item.updateTime ?? item.updatedAt
      ? toText(item.updateTime ?? item.updatedAt, "")
      : undefined,
});

export const normalizePracticeError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "练习仓库加载失败";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，或当前站点未代理 /repository/list。`;
  }

  if (message === "网络请求失败") {
    return "练习接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
};

const normalizePracticeModeError = (error: unknown, suffix: string) => {
  const message = error instanceof Error ? error.message : "练习模式接口调用失败";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，当前仅展示兜底说明。`;
  }

  if (message === "网络请求失败") {
    return `${suffix}接口暂时不可用，请检查服务是否启动后重试。`;
  }

  return message;
};

const normalizeQuestionTypes = (payload: unknown): PracticeQuestionType[] => {
  const record = toRecordOrEmpty(payload);
  const questionList = Array.isArray(payload)
    ? payload.map(toRecordOrEmpty)
    : Array.isArray(record.questionDTOList)
      ? (record.questionDTOList as unknown[]).map(toRecordOrEmpty)
      : [];

  return PRACTICE_QUESTION_TYPES.map((definition) => {
    const match = questionList.find(
      (item) => toNumberOrFallback(item.type, -1) === definition.type
    );
    const count = match
      ? toNumberOrFallback(
          match.num ??
            match.count ??
            match.questionNum ??
            match.total ??
            match.totalCount,
          0
        )
      : 0;

    return {
      ...definition,
      count,
    };
  });
};

const normalizeOverview = (
  repositoryId: string,
  payload: unknown
): PracticeModeOverview => {
  const record = toRecordOrEmpty(payload);

  return {
    title: toText(
      record.title ?? record.repositoryName ?? record.name,
      `题库 ${repositoryId}`
    ),
    description: toText(
      record.remark ?? record.description ?? record.repositoryIntro ?? record.summary,
      "当前题库暂未返回简介，后续接入完成后会在这里展示题库说明。"
    ),
    freePracticeActions: [...PRACTICE_FREE_ACTIONS],
    questionTypes: normalizeQuestionTypes(record.questionDTOList ?? record),
  };
};

const normalizeRecentRecords = (payload: unknown): PracticeRecentRecord[] => {
  const record = toRecordOrEmpty(payload);
  const list = Array.isArray(payload)
    ? payload.map(toRecordOrEmpty)
    : Array.isArray(record.records)
      ? (record.records as unknown[]).map(toRecordOrEmpty)
      : [];

  return list.slice(0, 5).map((item, index) => ({
    id: toText(item.id ?? item.userPracticeId, `recent-${index + 1}`),
    title: toText(
      item.practiceName ?? item.title ?? item.name,
      `最近练习 ${index + 1}`
    ),
    accuracy: `${toNumberOrFallback(item.accuracy ?? item.correctRate, 0)}%`,
    committedAt: toText(
      item.commitTime ?? item.updatedAt ?? item.createTime,
      "时间待补充"
    ),
  }));
};

const isOverviewPayloadEmpty = (payload: unknown) => {
  const record = toRecordOrEmpty(payload);
  return !(
    record.title ??
    record.repositoryName ??
    record.name ??
    record.remark ??
    record.description ??
    record.repositoryIntro ??
    record.summary ??
    record.questionDTOList
  );
};

export const fetchPracticeRepositories = async (
  query: PracticeQueryState
): Promise<PracticeRepositoryResult> => {
  const response = await getRepositoryList({
    pageNo: query.page,
    pageSize: PRACTICE_PAGE_SIZE,
    repositoryTitle: query.keyword,
  });
  const payload = toListPayload(unwrapEnvelope(response));

  return {
    items: payload.records.map(normalizeRepository),
    total: payload.total,
  };
};

export const fetchPracticeModeData = async (
  repositoryId: string
): Promise<PracticeModeResult> => {
  const [overviewResponse, recentResponse] = await Promise.allSettled([
    getRepositoryById(repositoryId),
    getRecentPractice(repositoryId),
  ]);

  let overviewPayload: unknown = null;
  let recentPayload: unknown = null;
  let overviewError: string | null = null;
  let recentError: string | null = null;
  let isOverviewEmpty = false;

  if (overviewResponse.status === "fulfilled") {
    overviewPayload = unwrapEnvelope(overviewResponse.value);
    isOverviewEmpty = isOverviewPayloadEmpty(overviewPayload);
    if (isOverviewEmpty) {
      overviewError = "题库详情接口已返回，但未提供标题、说明或题型统计，当前展示为安全降级内容。";
    }
  } else {
    overviewError = normalizePracticeModeError(
      overviewResponse.reason,
      "题库详情"
    );
  }

  if (recentResponse.status === "fulfilled") {
    recentPayload = unwrapEnvelope(recentResponse.value);
  } else {
    recentError = normalizePracticeModeError(
      recentResponse.reason,
      "最近练习"
    );
  }

  return {
    overview: normalizeOverview(repositoryId, overviewPayload),
    recentRecords: normalizeRecentRecords(recentPayload),
    overviewError,
    recentError,
    isOverviewEmpty,
  };
};
