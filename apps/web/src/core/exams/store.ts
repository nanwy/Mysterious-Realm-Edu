"use client";

import { create } from "zustand";
import type { ExamOnlineAnswerDraft } from "./types";

interface ExamClientState {
  activeExamId: string | null;
  setActiveExam: (examId: string | null) => void;
  onlineUserExamId: string | null;
  onlineCurrentIndex: number;
  onlineAnswers: ExamOnlineAnswerDraft[];
  onlineActionMessage: string | null;
  hydrateOnlineSession: (
    userExamId: string,
    cachedAnswers: ExamOnlineAnswerDraft[]
  ) => void;
  resetOnlineSession: () => void;
  setOnlineCurrentIndex: (index: number) => void;
  setOnlineAnswers: (answers: ExamOnlineAnswerDraft[]) => void;
  setOnlineActionMessage: (message: string | null) => void;
}

const initialOnlineState = {
  onlineUserExamId: null,
  onlineCurrentIndex: 0,
  onlineAnswers: [] satisfies ExamOnlineAnswerDraft[],
  onlineActionMessage: null,
};

export const useExamStore = create<ExamClientState>((set, get) => ({
  activeExamId: null,
  setActiveExam: (examId) => set({ activeExamId: examId }),
  ...initialOnlineState,
  hydrateOnlineSession: (userExamId, cachedAnswers) => {
    if (get().onlineUserExamId === userExamId) {
      return;
    }

    set({
      onlineUserExamId: userExamId,
      onlineCurrentIndex: 0,
      onlineAnswers: cachedAnswers,
      onlineActionMessage: null,
    });
  },
  resetOnlineSession: () => set(initialOnlineState),
  setOnlineCurrentIndex: (index) => set({ onlineCurrentIndex: index }),
  setOnlineAnswers: (answers) => set({ onlineAnswers: answers }),
  setOnlineActionMessage: (message) => set({ onlineActionMessage: message }),
}));
