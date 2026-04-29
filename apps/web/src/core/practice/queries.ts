"use client";

import { queryOptions } from "@tanstack/react-query";
import type { PracticeRepositoryListRequest } from "@workspace/api";
import { fetchPracticeModeData, fetchPracticeRepositories } from "./api";

export const practiceKeys = {
  all: ["practice"] as const,
  list: (query: PracticeRepositoryListRequest) =>
    [
      ...practiceKeys.all,
      "list",
      query.title ?? "",
      query.pageNo ?? 1,
      query.pageSize ?? "",
    ] as const,
  mode: (repositoryId: string) =>
    [...practiceKeys.all, "mode", repositoryId] as const,
};

export const practiceQueryOptions = {
  list: (query: PracticeRepositoryListRequest) =>
    queryOptions({
      queryKey: practiceKeys.list(query),
      queryFn: () => fetchPracticeRepositories(query),
    }),
  mode: (repositoryId: string) =>
    queryOptions({
      queryKey: practiceKeys.mode(repositoryId),
      queryFn: () => fetchPracticeModeData(repositoryId),
      enabled: Boolean(repositoryId),
    }),
};
