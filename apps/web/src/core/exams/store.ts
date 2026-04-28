"use client";

import { create } from "zustand";
import type { ExamOnlineAnswerDraft } from "./types";

export type ExamOnlineCacheStatus = "idle" | "saving" | "saved" | "error";
export type ExamOnlineSubmitStatus =
  | "idle"
  | "submitting"
  | "submitted"
  | "error";

interface ExamOnlineSliceState {
  onlineUserExamId: string | null;
  onlineCurrentIndex: number;
  onlineAnswers: ExamOnlineAnswerDraft[];
  onlineCacheStatus: ExamOnlineCacheStatus;
  onlineCacheRequestId: number;
  onlineSubmitStatus: ExamOnlineSubmitStatus;
}

interface ExamClientState extends ExamOnlineSliceState {
  activeExamId: string | null;
  setActiveExam: (examId: string | null) => void;

  hydrateOnline: (
    userExamId: string,
    cachedAnswers: ExamOnlineAnswerDraft[]
  ) => void;
  resetOnline: () => void;
  selectOnlineQuestionAt: (index: number) => void;
  shiftOnlineQuestion: (delta: number, lastIndex: number) => void;
  updateOnlineAnswers: (
    updater: (current: ExamOnlineAnswerDraft[]) => ExamOnlineAnswerDraft[]
  ) => void;
  setOnlineCacheStatus: (status: ExamOnlineCacheStatus) => void;
  beginOnlineCacheRequest: () => number;
  finishOnlineCacheRequest: (
    requestId: number,
    status: Extract<ExamOnlineCacheStatus, "saved" | "error">
  ) => void;
  setOnlineSubmitStatus: (status: ExamOnlineSubmitStatus) => void;
}

const initialOnlineSlice: ExamOnlineSliceState = {
  onlineUserExamId: null,
  onlineCurrentIndex: 0,
  onlineAnswers: [],
  onlineCacheStatus: "idle",
  onlineCacheRequestId: 0,
  onlineSubmitStatus: "idle",
};

const clamp = (value: number, max: number) =>
  Math.max(0, Math.min(Math.max(0, max), value));

export const useExamStore = create<ExamClientState>((set) => ({
  activeExamId: null,
  setActiveExam: (examId) => set({ activeExamId: examId }),

  ...initialOnlineSlice,

  hydrateOnline: (userExamId, cachedAnswers) =>
    set((state) =>
      state.onlineUserExamId === userExamId
        ? state
        : {
            ...initialOnlineSlice,
            onlineUserExamId: userExamId,
            onlineAnswers: cachedAnswers,
          }
    ),

  resetOnline: () => set(() => ({ ...initialOnlineSlice })),

  selectOnlineQuestionAt: (index) =>
    set(() => ({ onlineCurrentIndex: Math.max(0, index) })),

  shiftOnlineQuestion: (delta, lastIndex) =>
    set((state) => ({
      onlineCurrentIndex: clamp(state.onlineCurrentIndex + delta, lastIndex),
    })),

  updateOnlineAnswers: (updater) =>
    set((state) => ({ onlineAnswers: updater(state.onlineAnswers) })),

  setOnlineCacheStatus: (status) => set({ onlineCacheStatus: status }),
  beginOnlineCacheRequest: () => {
    let requestId = 0;
    set((state) => {
      requestId = state.onlineCacheRequestId + 1;
      return {
        onlineCacheRequestId: requestId,
        onlineCacheStatus: "saving",
      };
    });
    return requestId;
  },
  finishOnlineCacheRequest: (requestId, status) =>
    set((state) =>
      state.onlineCacheRequestId === requestId
        ? { onlineCacheStatus: status }
        : state
    ),
  setOnlineSubmitStatus: (status) => set({ onlineSubmitStatus: status }),
}));
