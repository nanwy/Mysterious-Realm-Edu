"use client";

import { create } from "zustand";

interface StudentUiState {
  keyword: string;
  setKeyword: (keyword: string) => void;
}

export const useStudentUiStore = create<StudentUiState>((set) => ({
  keyword: "",
  setKeyword: (keyword) => set({ keyword }),
}));

