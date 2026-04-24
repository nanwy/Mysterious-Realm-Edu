"use client";

import { queryOptions } from "@tanstack/react-query";
import { fetchPracticeModeData, fetchPracticeRepositories } from "./api";
import type { PracticeQueryState } from "./types";

export const practiceKeys = {
  all: ["practice"] as const,
  list: (query: PracticeQueryState) =>
    [...practiceKeys.all, "list", query.keyword, query.page] as const,
  mode: (repositoryId: string) =>
    [...practiceKeys.all, "mode", repositoryId] as const,
};

export const practiceQueryOptions = {
  list: (query: PracticeQueryState) =>
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

