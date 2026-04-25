"use client";

import { create } from "zustand";

interface CourseClientState {
  activeCourseId: string | null;
  setActiveCourse: (courseId: string | null) => void;
}

export const useCourseStore = create<CourseClientState>((set) => ({
  activeCourseId: null,
  setActiveCourse: (courseId) => set({ activeCourseId: courseId }),
}));
