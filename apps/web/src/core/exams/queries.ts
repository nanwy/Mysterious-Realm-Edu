"use client";

import { queryOptions } from "@tanstack/react-query";
import { fetchExamList, fetchExamOnlineSession, fetchExamPreview } from "./api";
import type { ExamFiltersState } from "./types";

export const examKeys = {
  all: ["exams"] as const,
  list: (filters: ExamFiltersState) =>
    [
      ...examKeys.all,
      "list",
      filters.examTitle,
      filters.examType,
      filters.state,
      filters.pageNo,
      filters.pageSize,
    ] as const,
  preview: (examId: string) => [...examKeys.all, "preview", examId] as const,
  online: (examId: string) => [...examKeys.all, "online", examId] as const,
};

export const examQueryOptions = {
  list: (filters: ExamFiltersState) =>
    queryOptions({
      queryKey: examKeys.list(filters),
      queryFn: () => fetchExamList(filters),
    }),
  preview: (examId: string) =>
    queryOptions({
      queryKey: examKeys.preview(examId),
      queryFn: () => fetchExamPreview(examId),
      enabled: Boolean(examId),
    }),
  online: (examId: string) =>
    queryOptions({
      queryKey: examKeys.online(examId),
      queryFn: () => fetchExamOnlineSession(examId),
      enabled: Boolean(examId),
    }),
};
