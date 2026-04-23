import { createApiClient } from "../client.ts";

const client = createApiClient();
type ExamId = string | number;
type UserExamId = string | number;

export interface OnlineExamAnswerDraftItem {
  index: string | number;
  questionType: number;
  answers?: Array<string | number>;
  answerIndex?: number[];
  subjectiveAnswer?: string;
  blankAnswer?: string;
  [key: string]: unknown;
}

export interface StartOnlineExamResult {
  id?: UserExamId;
  userExamId?: UserExamId;
  [key: string]: unknown;
}

export interface OnlineExamDetail {
  examId?: ExamId;
  userExamId?: UserExamId;
  limitTime?: string | null;
  userExamQuestionList?: unknown[];
  [key: string]: unknown;
}

export interface OnlineExamAnswerCache {
  examAnswers?: OnlineExamAnswerDraftItem[];
  [key: string]: unknown;
}

export interface CacheOnlineExamAnswersPayload {
  userExamId: UserExamId;
  examAnswers: OnlineExamAnswerDraftItem[];
  limitTime?: string | null;
}

export interface SubmitOnlineExamPayload {
  userExamId: UserExamId;
  examAnswers: OnlineExamAnswerDraftItem[];
}

export function getUserExamScore(examId: ExamId) {
  return client.get(`/exam/examScore?examId=${examId}`);
}

export function checkExamLimit(examId: ExamId) {
  return client.get(`/exam/checkToLimit?examId=${examId}`);
}

export function queryExamById(id: ExamId) {
  return client.get(`/exam/queryById?id=${id}`);
}

export function listExamIn() {
  return client.get("/exam/listExamIn");
}

export function createExam(examId: ExamId) {
  return client.get(`/exam/createExam?examId=${examId}`);
}

export function getExamDetail(userExamId: UserExamId) {
  return client.get(`/exam/examDetail?userExamId=${userExamId}`);
}

export function examRecordExist(examId: ExamId) {
  return client.get(`/exam/examRecordExist?examId=${examId}`);
}

export function getExamList(payload: Record<string, unknown>) {
  return client.post("/exam/list", payload);
}

export function submitExam(payload: SubmitOnlineExamPayload) {
  return client.post("/exam/submitExam", payload);
}

export function cacheExamAnswer(payload: CacheOnlineExamAnswersPayload) {
  return client.post("/exam/cacheExamAnswer", payload);
}

export function getCacheAnswer(userExamId: UserExamId) {
  return client.get(`/exam/getCacheAnswer?userExamId=${userExamId}`);
}

export function getUserExamResultDetail(userExamId: UserExamId) {
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

export function startOnlineExam(examId: ExamId) {
  return client.get<StartOnlineExamResult>(`/exam/createExam?examId=${examId}`);
}

export function getOnlineExamDetail(userExamId: UserExamId) {
  return client.get<OnlineExamDetail>(`/exam/examDetail?userExamId=${userExamId}`);
}

export function getOnlineExamAnswerCache(userExamId: UserExamId) {
  return client.get<OnlineExamAnswerCache>(`/exam/getCacheAnswer?userExamId=${userExamId}`);
}

export function cacheOnlineExamAnswers(payload: CacheOnlineExamAnswersPayload) {
  return client.post<null>("/exam/cacheExamAnswer", payload);
}

export function submitOnlineExam(payload: SubmitOnlineExamPayload) {
  return client.post<null>("/exam/submitExam", payload);
}
