"use client";

import { queryOptions } from "@tanstack/react-query";
import type { ExamListRequest } from "@workspace/api";
import { fetchScoreDetails, fetchScores } from "./api";

export const scoreKeys = {
  all: ["scores"] as const,
  list: (filters: ExamListRequest) =>
    [
      ...scoreKeys.all,
      "list",
      filters.examTitle,
      filters.passed,
      filters.pageNo,
      filters.pageSize,
    ] as const,
  details: (examId: string, filters: ExamListRequest) =>
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
  list: (filters: ExamListRequest) =>
    queryOptions({
      queryKey: scoreKeys.list(filters),
      queryFn: () => fetchScores(filters),
    }),
  details: (examId: string, filters: ExamListRequest) =>
    queryOptions({
      queryKey: scoreKeys.details(examId, filters),
      queryFn: () => fetchScoreDetails(examId, filters),
      enabled: Boolean(examId),
    }),
};
