"use client";

import { create } from "zustand";

interface MobileUiState {
  activePanel: "home" | "learn" | "exam" | "me";
  setActivePanel: (panel: MobileUiState["activePanel"]) => void;
}

export const useMobileUiStore = create<MobileUiState>((set) => ({
  activePanel: "home",
  setActivePanel: (activePanel) => set({ activePanel }),
}));

