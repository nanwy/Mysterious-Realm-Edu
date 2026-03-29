import { createApiClient } from "../client";

const client = createApiClient();

export function getRepositoryList(payload: Record<string, unknown>) {
  return client.post("/repository/list", payload);
}

export function getRepositoryById(id: string | number) {
  return client.get(`/repository/getById?id=${id}`);
}

export function listQuestionByMode(payload: Record<string, unknown>) {
  return client.post("/practice/listQuestionByMode", payload);
}

export function submitPractice(payload: Record<string, unknown>) {
  return client.post("/practice/submitPractice", payload);
}

export function getPracticeResult(userPracticeId: string | number) {
  return client.get(`/practice/getPracticeResult?id=${userPracticeId}`);
}

export function getRecentPractice(repositoryId: string | number) {
  return client.get(`/practice/getRecentPractice?repositoryId=${repositoryId}`);
}

export function getUserPracticeList(payload: Record<string, unknown>) {
  return client.post("/practice/userPractice/list", payload);
}
