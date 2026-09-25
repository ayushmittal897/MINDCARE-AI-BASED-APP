import { api } from "./client";

export async function emailAssessmentResult(body: { pdfBase64: string }): Promise<{ ok: boolean; message: string }> {
  const { data } = await api.post("/reports/email-result", body);
  return data;
}
