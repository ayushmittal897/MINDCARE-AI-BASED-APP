import type { AnalysisResult, ScreeningResult } from "@mindcare/types";
import { create } from "zustand";

export interface LastRunMeta {
  transcriptChars: number;
  transcriptText?: string;
  hasAudio: boolean;
  audioKb?: number;
  hasVideoFrame: boolean;
  videoFrameBase64?: string;
  sentAt: string;
}

interface AnalysisState {
  current: AnalysisResult | null;
  screeningResult: ScreeningResult | null;
  lastRun: LastRunMeta | null;
  loading: boolean;
  error: string | null;
  setResult: (r: AnalysisResult | null) => void;
  setScreeningResult: (r: ScreeningResult | null) => void;
  setLastRun: (m: LastRunMeta | null) => void;
  setLoading: (v: boolean) => void;
  setError: (e: string | null) => void;
  printMode: "patient" | "clinical" | null;
  setPrintMode: (mode: "patient" | "clinical" | null) => void;
  patientName: string;
  patientAge: string;
  setPatientInfo: (name: string, age: string) => void;
  clear: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  current: null,
  screeningResult: null,
  lastRun: null,
  loading: false,
  error: null,
  printMode: null,
  patientName: "",
  patientAge: "",
  setResult: (current) => set({ current }),
  setScreeningResult: (screeningResult) => set({ screeningResult }),
  setLastRun: (lastRun) => set({ lastRun }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setPrintMode: (printMode) => set({ printMode }),
  setPatientInfo: (patientName, patientAge) => set({ patientName, patientAge }),
  clear: () => set({ current: null, screeningResult: null, lastRun: null, patientName: "", patientAge: "", error: null, printMode: null }),
}));
