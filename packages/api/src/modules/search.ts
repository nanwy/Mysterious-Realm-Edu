import type { ApiHttpClient } from "../client";
import type {
  HotSearchCountRequest,
  HotSearchCountResponse,
  MySearchHistoryResponse,
  SearchListRequest,
  SearchListResponse,
} from "../types/search";

export const createSearchApi = (client: ApiHttpClient) => ({
  listSearch: (payload: SearchListRequest = {}) =>
    client.post<SearchListResponse>("/search/list", payload),

  addKeyword: ({ keyword }: { keyword: string }) =>
    client.get<void>("/search/addKeywordToHistory", {
      query: { keyword },
    }),

  hotSearchCount: ({ limitCount }: HotSearchCountRequest = {}) =>
    client.get<HotSearchCountResponse>("/search/hotSearchCount", {
      query: { limitCount },
    }),

  getMySearchHistory: () =>
    client.get<MySearchHistoryResponse>("/search/mySearchHistory"),
});
