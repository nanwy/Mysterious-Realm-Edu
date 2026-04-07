import { getRepositoryList, unwrapEnvelope } from "@workspace/api";
import { toText } from "@/lib/normalize";
import { PRACTICE_PAGE_SIZE, type PracticeQueryState, type PracticeRepositoryItem, type PracticeRepositoryResult } from "./practice-types";

function toListPayload(value: unknown) {
  if (Array.isArray(value)) {
    return {
      records: value as Array<Record<string, unknown>>,
      total: value.length,
    };
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const records = Array.isArray(record.records)
      ? (record.records as Array<Record<string, unknown>>)
      : Array.isArray(record.list)
        ? (record.list as Array<Record<string, unknown>>)
        : Array.isArray(record.rows)
          ? (record.rows as Array<Record<string, unknown>>)
          : Array.isArray(record.data)
            ? (record.data as Array<Record<string, unknown>>)
            : [];

    const totalValue = record.total ?? record.count ?? record.totalCount ?? records.length;
    const total = typeof totalValue === "number" ? totalValue : Number(totalValue) || records.length;

    return { records, total };
  }

  return {
    records: [] as Array<Record<string, unknown>>,
    total: 0,
  };
}

function normalizeRepository(item: Record<string, unknown>, index: number): PracticeRepositoryItem {
  return {
    id: toText(item.id ?? item.repositoryId ?? item.idString, `practice-${index + 1}`),
    title: toText(
      item.repositoryName ?? item.title ?? item.name,
      `题库 ${index + 1}`
    ),
    description: toText(
      item.description ?? item.remark ?? item.summary ?? item.repositoryIntro,
      "暂无题库说明，进入后可查看题目与练习模式。"
    ),
    questionCount: item.questionCount ?? item.questionNum ?? item.totalCount
      ? toText(item.questionCount ?? item.questionNum ?? item.totalCount, "")
      : undefined,
    updatedAt: item.updateTime ?? item.updatedAt
      ? toText(item.updateTime ?? item.updatedAt, "")
      : undefined,
  };
}

export function normalizePracticeError(error: unknown) {
  const message = error instanceof Error ? error.message : "练习仓库加载失败";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，或当前站点未代理 /repository/list。`;
  }

  if (message === "网络请求失败") {
    return "练习接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
}

export async function fetchPracticeRepositories(
  query: PracticeQueryState
): Promise<PracticeRepositoryResult> {
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
}
