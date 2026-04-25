import { createApiClient, type ApiHttpClient } from "../client";

export const createSearchApi = (client: ApiHttpClient) => ({
  listSearch: (payload?: Record<string, unknown>) =>
    client.post("/search/list", payload ?? {}),

  addKeyword: ({ keyword }: { keyword: string }) =>
    client.get("/search/addKeywordToHistory", {
      query: { keyword },
    }),

  hotSearchCount: ({ limitCount }: { limitCount?: number }) =>
    client.get("/search/hotSearchCount", {
      query: { limitCount },
    }),

  getMySearchHistory: () => client.get("/search/mySearchHistory"),
});

const defaultSearchApi = createSearchApi(createApiClient());

export function getSearchList(payload?: Record<string, unknown>) {
  return defaultSearchApi.listSearch(payload);
}

export function addKeyword(keyword: string) {
  return defaultSearchApi.addKeyword({ keyword });
}

export function hotSearchCount(limitCount?: number) {
  return defaultSearchApi.hotSearchCount({ limitCount });
}

export function getMySearchHistory() {
  return defaultSearchApi.getMySearchHistory();
}
