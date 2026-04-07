import { getQuestionnaireList, unwrapEnvelope } from "@workspace/api";
import { toText } from "@/lib/normalize";
import {
  QUESTIONNAIRE_PAGE_SIZE,
  type QuestionnaireItem,
  type QuestionnaireQueryState,
  type QuestionnaireResult,
} from "./questionnaire-types";

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

function normalizeQuestionnaire(
  item: Record<string, unknown>,
  index: number
): QuestionnaireItem {
  return {
    id: toText(item.id ?? item.questionnaireId, `questionnaire-${index + 1}`),
    title: toText(item.name ?? item.title, `问卷 ${index + 1}`),
    description: toText(
      item.remark ?? item.description ?? item.summary,
      "暂无问卷说明，可进入详情或填写页查看完整内容。"
    ),
    questionCount: toText(item.questionNum ?? item.questionCount ?? 0, "0"),
    answerCount: toText(item.answerNum ?? item.answerCount ?? 0, "0"),
    category: toText(item.type_dictText ?? item.typeName ?? item.type, "调查"),
    status: item.status_dictText
      ? toText(item.status_dictText, "")
      : item.publishStatus_dictText
        ? toText(item.publishStatus_dictText, "")
        : undefined,
    updatedAt:
      item.updateTime ?? item.updatedAt ?? item.createTime
        ? toText(item.updateTime ?? item.updatedAt ?? item.createTime, "")
        : undefined,
  };
}

export function normalizeQuestionnaireError(error: unknown) {
  const message = error instanceof Error ? error.message : "问卷列表加载失败";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，或当前站点未代理 /questionnaire/list。`;
  }

  if (message === "网络请求失败") {
    return "问卷接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
}

export async function fetchQuestionnaires(
  query: QuestionnaireQueryState
): Promise<QuestionnaireResult> {
  const response = await getQuestionnaireList({
    pageNo: query.page,
    pageSize: QUESTIONNAIRE_PAGE_SIZE,
    name: query.keyword,
    type: 1,
  });
  const payload = toListPayload(unwrapEnvelope(response));

  return {
    items: payload.records.map(normalizeQuestionnaire),
    total: payload.total,
  };
}
