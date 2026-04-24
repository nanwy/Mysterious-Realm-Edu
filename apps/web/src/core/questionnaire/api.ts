import { getQuestionnaireList, unwrapEnvelope } from "@workspace/api";
import { QUESTIONNAIRE_PAGE_SIZE, QUESTIONNAIRE_TYPE_STUDENT } from "./config";
import type {
  QuestionnaireItem,
  QuestionnaireQueryState,
  QuestionnaireResult,
} from "./types";
import { toNumberOrNull, toRecordOrEmpty, toText } from "@/lib/normalize";

interface QuestionnaireListPayload {
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

  const record = toRecordOrEmpty(value) as QuestionnaireListPayload;
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

export const normalizeQuestionnaire = (
  item: Record<string, unknown>,
  index: number
): QuestionnaireItem => ({
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
});

export const normalizeQuestionnaireError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "问卷列表加载失败";

  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    return `${message}。未检测到 NEXT_PUBLIC_API_BASE_URL，或当前站点未代理 /questionnaire/list。`;
  }

  if (message === "网络请求失败") {
    return "问卷接口暂时不可用，请检查服务是否启动或稍后重试。";
  }

  return message;
};

export const fetchQuestionnaires = async (
  query: QuestionnaireQueryState
): Promise<QuestionnaireResult> => {
  const response = await getQuestionnaireList({
    pageNo: query.page,
    pageSize: QUESTIONNAIRE_PAGE_SIZE,
    name: query.keyword,
    type: QUESTIONNAIRE_TYPE_STUDENT,
  });
  const payload = toListPayload(unwrapEnvelope(response));

  return {
    items: payload.records.map(normalizeQuestionnaire),
    total: payload.total,
  };
};

