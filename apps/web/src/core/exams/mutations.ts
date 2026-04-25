"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api, unwrapEnvelope } from "@workspace/api";
import { examKeys } from "./queries";

export const useCreateExamSessionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (examId: string) =>
      unwrapEnvelope(await api.exam.createExamSession({ examId })),
    onSuccess: (_result, examId) => {
      qc.invalidateQueries({ queryKey: examKeys.preview(examId) });
      qc.invalidateQueries({ queryKey: examKeys.all });
    },
  });
};

export const useSubmitExamMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) =>
      unwrapEnvelope(await api.exam.submitExam(payload)),
    onSuccess: (_result, payload) => {
      const examId = typeof payload.examId === "string" ? payload.examId : "";
      if (examId) {
        qc.invalidateQueries({ queryKey: examKeys.preview(examId) });
      }
      qc.invalidateQueries({ queryKey: examKeys.all });
    },
  });
};

export const useCacheExamAnswerMutation = () =>
  useMutation({
    mutationFn: async (payload: Record<string, unknown>) =>
      unwrapEnvelope(await api.exam.cacheExamAnswer(payload)),
  });
