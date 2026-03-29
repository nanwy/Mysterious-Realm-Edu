import { createApiClient, buildQuery } from "../client";

const client = createApiClient();

export function searchNewsList(queryString: string) {
  return client.get(`/article/searchNews/${queryString}`);
}

export function getNewsList(payload: Record<string, unknown>) {
  return client.post("/article/list", payload);
}

export function listRecommendedNews(payload: Record<string, unknown>) {
  return client.post("/article/recommendNews", payload);
}

export function getNewsDetail(path: string) {
  return client.get(`/article/detail/${path}`);
}

export function listHotNews(payload: Record<string, unknown>) {
  return client.post("/article/hotNews", payload);
}

export function getNewsSearchSuggestion(keyword: string) {
  return client.get(`/article/searchNews/${keyword}${buildQuery({})}`);
}

