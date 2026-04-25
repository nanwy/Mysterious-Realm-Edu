import { createApiClient, type ApiHttpClient } from "../client";
import type {
  ExamCacheAnswerRequest,
  ExamDetailListResponse,
  ExamDetailResponse,
  ExamLimitResponse,
  ExamListRequest,
  ExamListResponse,
  ExamPreviewResponse,
  ExamResultListResponse,
  ExamResultResponse,
  ExamSessionResponse,
  ExamSnapUploadRequest,
  ExamSubmitRequest,
} from "../types";

type Id = string | number;

export const createExamApi = (client: ApiHttpClient) => ({
  getUserExamScore: ({ examId }: { examId: Id }) =>
    client.get<ExamResultResponse>("/exam/examScore", {
      query: { examId },
    }),

  checkExamLimit: ({ examId }: { examId: Id }) =>
    client.get<ExamLimitResponse>("/exam/checkToLimit", {
      query: { examId },
    }),

  queryExamById: ({ id }: { id: Id }) =>
    client.get<ExamPreviewResponse>("/exam/queryById", {
      query: { id },
    }),

  listJoinedExams: () =>
    client.get<ExamDetailListResponse>("/exam/listExamIn"),

  createExamSession: ({ examId }: { examId: Id }) =>
    client.get<ExamSessionResponse>("/exam/createExam", {
      query: { examId },
    }),

  getExamDetail: ({ userExamId }: { userExamId: Id }) =>
    client.get<ExamDetailResponse>("/exam/examDetail", {
      query: { userExamId },
    }),

  examRecordExists: ({ examId }: { examId: Id }) =>
    client.get<ExamDetailResponse>("/exam/examRecordExist", {
      query: { examId },
    }),

  listExams: (payload: ExamListRequest) =>
    client.post<ExamListResponse>("/exam/list", payload),

  submitExam: (payload: ExamSubmitRequest) =>
    client.post<ExamSessionResponse>("/exam/submitExam", payload),

  cacheExamAnswer: (payload: ExamCacheAnswerRequest) =>
    client.post<unknown>("/exam/cacheExamAnswer", payload),

  getCacheAnswer: ({ userExamId }: { userExamId: Id }) =>
    client.get<unknown>("/exam/getCacheAnswer", {
      query: { userExamId },
    }),

  getUserExamResultDetail: ({ userExamId }: { userExamId: Id }) =>
    client.get<ExamResultResponse>("/exam/userExamResultDetail", {
      query: { userExamId },
    }),

  getUserExamResultList: (payload: ExamListRequest) =>
    client.post<ExamResultListResponse>("/exam/userExamResult/list", payload),

  getUserExamDetailList: (payload: ExamListRequest) =>
    client.post<ExamDetailListResponse>("/exam/userExamDetail/list", payload),

  uploadExamSnap: (payload: ExamSnapUploadRequest) =>
    client.post<unknown>("/exam/uploadExamSnap", payload),

  listLatestExam: ({ limit }: { limit: number }) =>
    client.get<ExamListResponse>("/index/listLatestExam", {
      query: { limit },
    }),
});

const defaultExamApi = createExamApi(createApiClient());

export function getUserExamScore(examId: Id) {
  return defaultExamApi.getUserExamScore({ examId });
}

export function checkExamLimit(examId: Id) {
  return defaultExamApi.checkExamLimit({ examId });
}

export function queryExamById(id: Id) {
  return defaultExamApi.queryExamById({ id });
}

export function listExamIn() {
  return defaultExamApi.listJoinedExams();
}

export function createExam(examId: Id) {
  return defaultExamApi.createExamSession({ examId });
}

export function getExamDetail(userExamId: Id) {
  return defaultExamApi.getExamDetail({ userExamId });
}

export function examRecordExist(examId: Id) {
  return defaultExamApi.examRecordExists({ examId });
}

export function getExamList(payload: ExamListRequest) {
  return defaultExamApi.listExams(payload);
}

export function submitExam(payload: ExamSubmitRequest) {
  return defaultExamApi.submitExam(payload);
}

export function cacheExamAnswer(payload: ExamCacheAnswerRequest) {
  return defaultExamApi.cacheExamAnswer(payload);
}

export function getCacheAnswer(userExamId: Id) {
  return defaultExamApi.getCacheAnswer({ userExamId });
}

export function getUserExamResultDetail(userExamId: Id) {
  return defaultExamApi.getUserExamResultDetail({ userExamId });
}

export function getUserExamResultList(payload: ExamListRequest) {
  return defaultExamApi.getUserExamResultList(payload);
}

export function getUserExamDetailList(payload: ExamListRequest) {
  return defaultExamApi.getUserExamDetailList(payload);
}

export function uploadExamSnap(payload: ExamSnapUploadRequest) {
  return defaultExamApi.uploadExamSnap(payload);
}

export function listLatestExam(limit: number) {
  return defaultExamApi.listLatestExam({ limit });
}
