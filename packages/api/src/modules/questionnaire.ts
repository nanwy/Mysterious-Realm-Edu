import { createApiClient, type ApiHttpClient } from "../client";

type Id = string | number;

export const createQuestionnaireApi = (client: ApiHttpClient) => ({
  listQuestionnaires: (payload: Record<string, unknown>) =>
    client.post("/questionnaire/list", payload),

  getQuestionnaire: ({ questionnaireId }: { questionnaireId: Id }) =>
    client.get("/questionnaire/queryById", {
      query: { id: questionnaireId },
    }),
});

const defaultQuestionnaireApi = createQuestionnaireApi(createApiClient());

export function getQuestionnaireList(payload: Record<string, unknown>) {
  return defaultQuestionnaireApi.listQuestionnaires(payload);
}

export function getQuestionnaire(questionnaireId: Id) {
  return defaultQuestionnaireApi.getQuestionnaire({ questionnaireId });
}
