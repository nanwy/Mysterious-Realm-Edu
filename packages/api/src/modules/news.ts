import { createApiClient, type ApiHttpClient } from "../client";

export const createNewsApi = (client: ApiHttpClient) => ({
  searchNews: ({ queryString }: { queryString: string }) =>
    client.get(`/article/searchNews/${encodeURIComponent(queryString)}`),

  listNews: (payload: Record<string, unknown>) =>
    client.post("/article/list", payload),

  listRecommendedNews: (payload: Record<string, unknown>) =>
    client.post("/article/recommendNews", payload),

  getNewsDetail: ({ path }: { path: string }) =>
    client.get(`/article/detail/${path}`),

  listHotNews: (payload: Record<string, unknown>) =>
    client.post("/article/hotNews", payload),

  getNewsSearchSuggestion: ({ keyword }: { keyword: string }) =>
    client.get(`/article/searchNews/${encodeURIComponent(keyword)}`),
});

const defaultNewsApi = createNewsApi(createApiClient());

export function searchNewsList(queryString: string) {
  return defaultNewsApi.searchNews({ queryString });
}

export function getNewsList(payload: Record<string, unknown>) {
  return defaultNewsApi.listNews(payload);
}

export function listRecommendedNews(payload: Record<string, unknown>) {
  return defaultNewsApi.listRecommendedNews(payload);
}

export function getNewsDetail(path: string) {
  return defaultNewsApi.getNewsDetail({ path });
}

export function listHotNews(payload: Record<string, unknown>) {
  return defaultNewsApi.listHotNews(payload);
}

export function getNewsSearchSuggestion(keyword: string) {
  return defaultNewsApi.getNewsSearchSuggestion({ keyword });
}
