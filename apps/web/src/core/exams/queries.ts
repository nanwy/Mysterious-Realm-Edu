"use client";

import { queryOptions } from "@tanstack/react-query";
import type { ExamListRequest } from "@workspace/api";
import { fetchExamList, fetchExamOnlineSession, fetchExamPreview } from "./api";

export const examKeys = {
  all: ["exams"] as const,
  lists: () => [...examKeys.all, "list"] as const,
  list: (filters: ExamListRequest) =>
    [
      ...examKeys.lists(),
      filters.examTitle,
      filters.examType,
      filters.state,
      filters.pageNo,
      filters.pageSize,
    ] as const,
  preview: (examId: string) => [...examKeys.all, "preview", examId] as const,
  online: (examId: string, userExamId?: string) =>
    [...examKeys.all, "online", examId, userExamId ?? "new"] as const,
};

export const examQueryOptions = {
  list: (filters: ExamListRequest) =>
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
  online: (examId: string, userExamId?: string) =>
    queryOptions({
      queryKey: examKeys.online(examId, userExamId),
      queryFn: () => fetchExamOnlineSession(examId, userExamId),
      enabled: Boolean(examId),
    }),
};
