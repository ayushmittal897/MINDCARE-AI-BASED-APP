import type { SessionSummary } from "@mindcare/types";
import { create } from "zustand";

interface SessionState {
  timeline: SessionSummary[];
  setTimeline: (s: SessionSummary[]) => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  timeline: [],
  setTimeline: (timeline) => set({ timeline }),
}));
