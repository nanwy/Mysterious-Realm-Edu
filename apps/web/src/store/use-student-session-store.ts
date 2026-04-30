"use client";

import type { AuthUser } from "@workspace/api";
import { create } from "zustand";

interface StudentSessionState {
  token: string | null;
  userInfo: AuthUser | null;
  setSession: (session: Pick<StudentSessionState, "token" | "userInfo">) => void;
  clearSession: () => void;
}

const initialSession = {
  token: null,
  userInfo: null,
} satisfies Pick<StudentSessionState, "token" | "userInfo">;

export const useStudentSessionStore = create<StudentSessionState>((set) => ({
  ...initialSession,
  setSession: (session) => set(session),
  clearSession: () => set(initialSession),
}));
