"use client";

import { create } from "zustand";

interface ExamClientState {
  activeExamId: string | null;
  setActiveExam: (examId: string | null) => void;
}

export const useExamStore = create<ExamClientState>((set) => ({
  activeExamId: null,
  setActiveExam: (examId) => set({ activeExamId: examId }),
}));
