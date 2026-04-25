"use client";

import { queryOptions } from "@tanstack/react-query";
import {
  fetchNewsDetailData,
  fetchNewsPageData,
  fetchNewsSuggestions,
} from "./api";
import type { NewsQueryState } from "./types";

export const newsKeys = {
  all: ["news"] as const,
  list: (query: NewsQueryState) =>
    [...newsKeys.all, "list", query.keyword, query.page] as const,
  suggestions: (keyword: string) =>
    [...newsKeys.all, "suggestions", keyword.trim()] as const,
  detail: (newsId: string) => [...newsKeys.all, "detail", newsId] as const,
};

export const newsQueryOptions = {
  list: (query: NewsQueryState) =>
    queryOptions({
      queryKey: newsKeys.list(query),
      queryFn: () => fetchNewsPageData(query),
    }),
  suggestions: (keyword: string) =>
    queryOptions({
      queryKey: newsKeys.suggestions(keyword),
      queryFn: () => fetchNewsSuggestions(keyword),
      enabled: keyword.trim().length > 0,
    }),
  detail: (newsId: string) =>
    queryOptions({
      queryKey: newsKeys.detail(newsId),
      queryFn: () => fetchNewsDetailData(newsId),
      enabled: Boolean(newsId),
    }),
};

