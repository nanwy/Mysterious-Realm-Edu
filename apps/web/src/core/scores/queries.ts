"use client";

import { queryOptions } from "@tanstack/react-query";
import { fetchScoreDetails, fetchScores } from "./api";
import type { ScoreDetailsFiltersState, ScoreFiltersState } from "./types";

export const scoreKeys = {
  all: ["scores"] as const,
  list: (filters: ScoreFiltersState) =>
    [
      ...scoreKeys.all,
      "list",
      filters.examTitle,
      filters.passed,
      filters.pageNo,
      filters.pageSize,
    ] as const,
  details: (examId: string, filters: ScoreDetailsFiltersState) =>
    [
      ...scoreKeys.all,
      "details",
      examId,
      filters.passed,
      filters.pageNo,
      filters.pageSize,
    ] as const,
};

export const scoreQueryOptions = {
  list: (filters: ScoreFiltersState) =>
    queryOptions({
      queryKey: scoreKeys.list(filters),
      queryFn: () => fetchScores(filters),
    }),
  details: (examId: string, filters: ScoreDetailsFiltersState) =>
    queryOptions({
      queryKey: scoreKeys.details(examId, filters),
      queryFn: () => fetchScoreDetails(examId, filters),
      enabled: Boolean(examId),
    }),
};

