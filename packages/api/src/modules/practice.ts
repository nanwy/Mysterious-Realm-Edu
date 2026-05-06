import { type ApiHttpClient } from "../client";
import type {
  PracticeQuestionListRequest,
  PracticeQuestionListResponse,
  PracticeRepositoryDetailRequest,
  PracticeRepositoryDetailResponse,
  PracticeRepositoryListRequest,
  PracticeRepositoryListResponse,
  UserPracticeListRequest,
  UserPracticeListResponse,
  UserPracticeRecentResponse,
  UserPracticeResultResponse,
  UserPracticeSubmitRequest,
  UserPracticeSubmitResponse,
} from "../types";

export const createPracticeApi = (client: ApiHttpClient) => ({
  listRepositories: (payload: PracticeRepositoryListRequest) =>
    client.post<PracticeRepositoryListResponse>("/repository/list", payload),

  getRepositoryById: ({ id }: PracticeRepositoryDetailRequest) =>
    client.get<PracticeRepositoryDetailResponse>("/repository/getById", {
      query: { id },
    }),

  listQuestionByMode: (payload: PracticeQuestionListRequest) =>
    client.post<PracticeQuestionListResponse>(
      "/practice/listQuestionByMode",
      payload
    ),

  submitPractice: (payload: UserPracticeSubmitRequest) =>
    client.post<UserPracticeSubmitResponse>(
      "/practice/submitPractice",
      payload
    ),

  getPracticeResult: ({
    userPracticeId,
  }: {
    userPracticeId: string | number;
  }) =>
    client.get<UserPracticeResultResponse>("/practice/getPracticeResult", {
      query: { id: userPracticeId },
    }),

  getRecentPractice: ({ repositoryId }: { repositoryId: string | number }) =>
    client.get<UserPracticeRecentResponse>("/practice/getRecentPractice", {
      query: { repositoryId },
    }),

  listUserPractices: (payload: UserPracticeListRequest) =>
    client.post<UserPracticeListResponse>(
      "/practice/userPractice/list",
      payload
    ),
});
