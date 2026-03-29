import { createApiClient } from "../client";

const client = createApiClient();

export function getUserExamScore(examId: string | number) {
  return client.get(`/exam/examScore?examId=${examId}`);
}

export function checkExamLimit(examId: string | number) {
  return client.get(`/exam/checkToLimit?examId=${examId}`);
}

export function queryExamById(id: string | number) {
  return client.get(`/exam/queryById?id=${id}`);
}

export function listExamIn() {
  return client.get("/exam/listExamIn");
}

export function createExam(examId: string | number) {
  return client.get(`/exam/createExam?examId=${examId}`);
}

export function getExamDetail(userExamId: string | number) {
  return client.get(`/exam/examDetail?userExamId=${userExamId}`);
}

export function examRecordExist(examId: string | number) {
  return client.get(`/exam/examRecordExist?examId=${examId}`);
}

export function getExamList(payload: Record<string, unknown>) {
  return client.post("/exam/list", payload);
}

export function submitExam(payload: Record<string, unknown>) {
  return client.post("/exam/submitExam", payload);
}

export function cacheExamAnswer(payload: Record<string, unknown>) {
  return client.post("/exam/cacheExamAnswer", payload);
}

export function getCacheAnswer(userExamId: string | number) {
  return client.get(`/exam/getCacheAnswer?userExamId=${userExamId}`);
}

export function getUserExamResultDetail(userExamId: string | number) {
  return client.get(`/exam/userExamResultDetail?userExamId=${userExamId}`);
}

export function getUserExamResultList(payload: Record<string, unknown>) {
  return client.post("/exam/userExamResult/list", payload);
}

export function getUserExamDetailList(payload: Record<string, unknown>) {
  return client.post("/exam/userExamDetail/list", payload);
}

export function uploadExamSnap(payload: Record<string, unknown>) {
  return client.post("/exam/uploadExamSnap", payload);
}

export function listLatestExam(limit: number) {
  return client.get(`/index/listLatestExam?limit=${limit}`);
}
