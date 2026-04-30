"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  api,
  type ExamCacheAnswerRequest,
  type ExamSubmitRequest,
  type InvigilateCheatRequest,
  unwrapEnvelope,
} from "@workspace/api";
import { examKeys } from "./queries";

export const useCreateExamSessionMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (examId: string) =>
      unwrapEnvelope(await api.exam.createExamSession({ examId })),
    onSuccess: (_result, examId) => {
      qc.invalidateQueries({ queryKey: examKeys.preview(examId) });
      qc.invalidateQueries({ queryKey: examKeys.lists() });
      // Starting a new attempt produces a fresh `userExamId` and empty
      // `cachedAnswers`; drop any stale online cache for this examId so the
      // online page hydrates from the new session.
      qc.invalidateQueries({ queryKey: examKeys.online(examId) });
    },
  });
};

export const useSubmitExamMutation = (examId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ExamSubmitRequest) =>
      unwrapEnvelope(await api.exam.submitExam(payload)),
    onSuccess: () => {
      if (examId) {
        qc.invalidateQueries({ queryKey: examKeys.preview(examId) });
      }
      qc.invalidateQueries({ queryKey: examKeys.lists() });
    },
  });
};

export const useCacheExamAnswerMutation = () =>
  useMutation({
    mutationFn: async (payload: ExamCacheAnswerRequest) =>
      unwrapEnvelope(await api.exam.cacheExamAnswer(payload)),
  });

export const useReportScreenSwitchMutation = () =>
  useMutation({
    mutationFn: async (payload: InvigilateCheatRequest) =>
      unwrapEnvelope(await api.invigilate.reportCheat(payload)),
  });

export const useCountScreenSwitchMutation = () =>
  useMutation({
    mutationFn: async (payload: InvigilateCheatRequest) =>
      unwrapEnvelope(await api.invigilate.countCheat(payload)),
  });
