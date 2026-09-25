import type { AnalysisResult, SessionSummary } from "@mindcare/types";
import { api } from "./client";

export async function runAnalysis(payload: {
  transcript?: string;
  audioBase64?: string;
  videoBase64?: string;
}): Promise<AnalysisResult> {
  const { data } = await api.post("/analysis/session", payload);
  return data;
}

export async function getReport(sessionId: string): Promise<AnalysisResult> {
  const { data } = await api.get(`/reports/${sessionId}`);
  return data;
}

export async function getHistory(): Promise<SessionSummary[]> {
  const { data } = await api.get("/reports");
  return data;
}

export async function emailResult(pdfBase64: string): Promise<{ ok: boolean, message: string }> {
  const { data } = await api.post("/reports/email-result", { pdfBase64 });
  return data;
}
