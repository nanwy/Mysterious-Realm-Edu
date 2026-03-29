import { createApiClient, buildQuery } from "../client";

const client = createApiClient();

export function getQuestionnaireList(payload: Record<string, unknown>) {
  return client.post("/questionnaire/list", payload);
}

export function getQuestionnaire(questionnaireId: string | number) {
  return client.get(`/questionnaire/queryById${buildQuery({ id: questionnaireId })}`);
}

