import { createApiClient, type ApiHttpClient } from "../client";

type Id = string | number;

export const createPracticeApi = (client: ApiHttpClient) => ({
  listRepositories: (payload: Record<string, unknown>) =>
    client.post("/repository/list", payload),

  getRepositoryById: ({ id }: { id: Id }) =>
    client.get("/repository/getById", {
      query: { id },
    }),

  listQuestionByMode: (payload: Record<string, unknown>) =>
    client.post("/practice/listQuestionByMode", payload),

  submitPractice: (payload: Record<string, unknown>) =>
    client.post("/practice/submitPractice", payload),

  getPracticeResult: ({ userPracticeId }: { userPracticeId: Id }) =>
    client.get("/practice/getPracticeResult", {
      query: { id: userPracticeId },
    }),

  getRecentPractice: ({ repositoryId }: { repositoryId: Id }) =>
    client.get("/practice/getRecentPractice", {
      query: { repositoryId },
    }),

  listUserPractices: (payload: Record<string, unknown>) =>
    client.post("/practice/userPractice/list", payload),
});

const defaultPracticeApi = createPracticeApi(createApiClient());

export function getRepositoryList(payload: Record<string, unknown>) {
  return defaultPracticeApi.listRepositories(payload);
}

export function getRepositoryById(id: Id) {
  return defaultPracticeApi.getRepositoryById({ id });
}

export function listQuestionByMode(payload: Record<string, unknown>) {
  return defaultPracticeApi.listQuestionByMode(payload);
}

export function submitPractice(payload: Record<string, unknown>) {
  return defaultPracticeApi.submitPractice(payload);
}

export function getPracticeResult(userPracticeId: Id) {
  return defaultPracticeApi.getPracticeResult({ userPracticeId });
}

export function getRecentPractice(repositoryId: Id) {
  return defaultPracticeApi.getRecentPractice({ repositoryId });
}

export function getUserPracticeList(payload: Record<string, unknown>) {
  return defaultPracticeApi.listUserPractices(payload);
}
