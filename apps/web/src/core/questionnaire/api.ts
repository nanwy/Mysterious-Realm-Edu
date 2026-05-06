import {
  api,
  type QuestionnaireListRequest,
  type QuestionnaireRecord,
  unwrapEnvelope,
} from "@workspace/api";
import { QUESTIONNAIRE_PAGE_SIZE, QUESTIONNAIRE_TYPE_STUDENT } from "./config";

export const getQuestionnaireErrorMessage = (error: unknown) => {
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
  query: QuestionnaireListRequest
): Promise<{
  records: QuestionnaireRecord[];
  total: number;
}> => {
  const response = await api.questionnaire.listQuestionnaires({
    ...query,
    pageNo: query.pageNo,
    pageSize: QUESTIONNAIRE_PAGE_SIZE,
    type: QUESTIONNAIRE_TYPE_STUDENT,
  });
  const payload = unwrapEnvelope(response);

  return { records: payload?.records ?? [], total: payload?.total ?? 0 };
};
