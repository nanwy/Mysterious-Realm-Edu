import {
  getRecentPractice,
  getRepositoryById,
  unwrapEnvelope,
} from "@workspace/api";
import { toNumberOrFallback, toText } from "@/lib/normalize";
import type {
  PracticeModeAction,
  PracticeModeOverview,
  PracticeModeResult,
  PracticeQuestionType,
  PracticeRecentRecord,
} from "./practice-mode-types";

const DEFAULT_FREE_PRACTICE_ACTIONS: PracticeModeAction[] = [
  {
    id: "sequence",
    title: "顺序练习",
    description: "按题目原始顺序逐题练习，适合首次通读题库。",
    query: "mode=1",
  },
  {
    id: "random",
    title: "随机练习",
    description: "打散题目顺序，适合查漏补缺和快速复盘。",
    query: "mode=2",
  },
];

const QUESTION_TYPE_DEFINITIONS = [
  {
    id: "single-choice",
    type: 1,
    title: "单选题",
    description: "按单选题集中练习，保持基础题型节奏。",
  },
  {
    id: "multiple-choice",
    type: 2,
    title: "多选题",
    description: "集中处理多选题，强化选项辨析能力。",
  },
  {
    id: "judgement",
    type: 3,
    title: "判断题",
    description: "快速回顾知识点，适合做日常短练。",
  },
  {
    id: "fill-blank",
    type: 5,
    title: "填空题",
    description: "聚焦关键词填写，检验记忆与理解程度。",
  },
] as const;

function normalizePracticeModeError(error: unknown, suffix: string) {
  const message = error instanceof Error ? error.message : "练习模式接口调用失败";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，当前仅展示兜底说明。`;
  }

  if (message === "网络请求失败") {
    return `${suffix}接口暂时不可用，请检查服务是否启动后重试。`;
  }

  return message;
}

function normalizeQuestionTypes(payload: unknown): PracticeQuestionType[] {
  const questionList = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as Record<string, unknown>).questionDTOList)
      ? ((payload as Record<string, unknown>).questionDTOList as Array<Record<string, unknown>>)
      : [];

  return QUESTION_TYPE_DEFINITIONS.map((definition) => {
    const match = questionList.find((item) => toNumberOrFallback(item.type, -1) === definition.type);
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
}

function normalizeOverview(
  repositoryId: string,
  payload: unknown
): PracticeModeOverview {
  const record =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};

  return {
    title: toText(
      record.title ?? record.repositoryName ?? record.name,
      `题库 ${repositoryId}`
    ),
    description: toText(
      record.remark ?? record.description ?? record.repositoryIntro ?? record.summary,
      "当前题库暂未返回简介，后续接入完成后会在这里展示题库说明。"
    ),
    freePracticeActions: DEFAULT_FREE_PRACTICE_ACTIONS,
    questionTypes: normalizeQuestionTypes(record.questionDTOList ?? record),
  };
}

function normalizeRecentRecords(payload: unknown): PracticeRecentRecord[] {
  const list = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as Record<string, unknown>).records)
      ? ((payload as Record<string, unknown>).records as Array<Record<string, unknown>>)
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
}

function isOverviewPayloadEmpty(payload: unknown) {
  if (!payload || typeof payload !== "object") {
    return true;
  }

  const record = payload as Record<string, unknown>;
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
}

export async function fetchPracticeModeData(
  repositoryId: string
): Promise<PracticeModeResult> {
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
}
