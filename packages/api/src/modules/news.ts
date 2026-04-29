import { type ApiHttpClient } from "../client";
import type {
  NewsDetailResponse,
  NewsListRequest,
  NewsListResponse,
  NewsSearchResponse,
} from "../types";

type Id = string | number;

export const createNewsApi = (client: ApiHttpClient) => ({
  searchNews: ({ queryString }: { queryString: string }) =>
    client.get<NewsSearchResponse>(
      `/article/searchNews/${encodeURIComponent(queryString)}`
    ),

  listNews: (payload: NewsListRequest) =>
    client.post<NewsListResponse>("/article/list", payload),

  listRecommendedNews: (payload: NewsListRequest) =>
    client.post<NewsListResponse>("/article/recommendNews", payload),

  getNewsDetail: ({ path }: { path: Id }) =>
    client.get<NewsDetailResponse>(
      `/article/detail/${encodeURIComponent(String(path))}`
    ),

  listHotNews: (payload: NewsListRequest) =>
    client.post<NewsListResponse>("/article/hotNews", payload),

  getNewsSearchSuggestion: ({ keyword }: { keyword: string }) =>
    client.get<NewsSearchResponse>(
      `/article/searchNews/${encodeURIComponent(keyword)}`
    ),
});
