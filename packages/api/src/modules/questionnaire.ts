import { type ApiHttpClient } from "../client";
import type {
  QuestionnaireDetailResponse,
  QuestionnaireId,
  QuestionnaireListRequest,
  QuestionnaireListResponse,
} from "../types";


export const createQuestionnaireApi = (client: ApiHttpClient) => ({
  listQuestionnaires: (payload: QuestionnaireListRequest) =>
    client.post<QuestionnaireListResponse>("/questionnaire/list", payload),

  getQuestionnaire: ({
    questionnaireId,
  }: {
    questionnaireId: QuestionnaireId;
  }) =>
    client.get<QuestionnaireDetailResponse>("/questionnaire/queryById", {
      query: { id: questionnaireId },
    }),
});
