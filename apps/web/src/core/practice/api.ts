import { api, unwrapEnvelope } from "@workspace/api";
import type {
  PracticeQuestionTypeCountDetail,
  PracticeRepositoryDetail,
  PracticeRepositoryListRequest,
  PracticeRepositoryListResponse,
  UserPracticeDetail,
} from "@workspace/api";
import {
  PRACTICE_FREE_ACTIONS,
  PRACTICE_PAGE_SIZE,
  PRACTICE_QUESTION_TYPES,
} from "./config";

const EMPTY_REPOSITORY_LIST: PracticeRepositoryListResponse = {
  records: [],
  total: 0,
};

const resolveQuestionTypeCount = (
  items: PracticeQuestionTypeCountDetail[] | undefined,
  type: number
) => {
  const match = items?.find((item) => item.type === type);
  return match?.num ?? match?.categoryCount ?? 0;
};

export const buildPracticeModeOverview = (
  repository: PracticeRepositoryDetail | null,
  repositoryId: string
) => {
  const title = repository?.title?.trim() || `题库 ${repositoryId}`;
  const description =
    repository?.remark?.trim() ||
    repository?.questionRemark?.trim() ||
    "当前题库暂未返回简介，后续接入完成后会在这里展示题库说明。";

  return {
    title,
    description,
    freePracticeActions: [...PRACTICE_FREE_ACTIONS],
    questionTypes: PRACTICE_QUESTION_TYPES.map((definition) => ({
      ...definition,
      count: resolveQuestionTypeCount(
        repository?.questionDTOList,
        definition.type
      ),
    })),
  };
};

export const buildPracticeRecentRecordView = (
  record: UserPracticeDetail,
  index: number
) => ({
  id: record.id ?? `recent-${index + 1}`,
  title: record.practiceName?.trim() || `最近练习 ${index + 1}`,
  accuracy: `${record.accuracy ?? 0}%`,
  committedAt:
    record.commitTime ?? record.updateTime ?? record.createTime ?? "时间待补充",
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
  const message =
    error instanceof Error ? error.message : "练习模式接口调用失败";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，当前仅展示兜底说明。`;
  }

  if (message === "网络请求失败") {
    return `${suffix}接口暂时不可用，请检查服务是否启动后重试。`;
  }

  return message;
};

const isRepositoryEmpty = (repository: PracticeRepositoryDetail | null) =>
  !(
    repository?.title ??
    repository?.remark ??
    repository?.questionRemark ??
    repository?.questionDTOList
  );

export const fetchPracticeRepositories = async (
  query: PracticeRepositoryListRequest
): Promise<PracticeRepositoryListResponse> => {
  const response = await api.practice.listRepositories({
    pageNo: query.pageNo,
    pageSize: query.pageSize ?? PRACTICE_PAGE_SIZE,
    title: query.title,
  });

  return unwrapEnvelope(response) ?? EMPTY_REPOSITORY_LIST;
};

export const fetchPracticeModeData = async (repositoryId: string) => {
  const [repositoryResponse, recentResponse] = await Promise.allSettled([
    api.practice.getRepositoryById({ id: repositoryId }),
    api.practice.getRecentPractice({ repositoryId }),
  ]);

  let repository: PracticeRepositoryDetail | null = null;
  let recentRecords: UserPracticeDetail[] = [];
  let overviewError: string | null = null;
  let recentError: string | null = null;
  let isOverviewEmpty = false;

  if (repositoryResponse.status === "fulfilled") {
    repository = unwrapEnvelope(repositoryResponse.value);
    isOverviewEmpty = isRepositoryEmpty(repository);
    if (isOverviewEmpty) {
      overviewError =
        "题库详情接口已返回，但未提供标题、说明或题型统计，当前展示为安全降级内容。";
    }
  } else {
    overviewError = normalizePracticeModeError(
      repositoryResponse.reason,
      "题库详情"
    );
  }

  if (recentResponse.status === "fulfilled") {
    recentRecords = unwrapEnvelope(recentResponse.value) ?? [];
  } else {
    recentError = normalizePracticeModeError(recentResponse.reason, "最近练习");
  }

  return {
    overview: buildPracticeModeOverview(repository, repositoryId),
    recentRecords: recentRecords.slice(0, 5).map(buildPracticeRecentRecordView),
    overviewError,
    recentError,
    isOverviewEmpty,
  };
};
