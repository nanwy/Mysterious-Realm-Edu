import { createApiClient, buildQuery } from "../client";

const client = createApiClient();

export function getSearchList(payload?: Record<string, unknown>) {
  return client.post("/search/list", payload ?? {});
}

export function addKeyword(keyword: string) {
  return client.get(`/search/addKeywordToHistory${buildQuery({ keyword })}`);
}

export function hotSearchCount(limitCount?: number) {
  return client.get(`/search/hotSearchCount${buildQuery({ limitCount })}`);
}

export function getMySearchHistory() {
  return client.get("/search/mySearchHistory");
}

