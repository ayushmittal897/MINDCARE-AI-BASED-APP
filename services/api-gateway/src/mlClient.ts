import type { AnalysisResult } from "@mindcare/types";
import { HttpError } from "./utils/errors.js";
import { logger } from "./utils/logger.js";

const ML = process.env.ML_CORE_URL ?? "http://localhost:8000";

export async function analyzeMultimodal(body: {
  transcript?: string;
  audioBase64?: string;
  videoBase64?: string;
  userId: string;
}): Promise<AnalysisResult> {
  const url = `${ML.replace(/\/$/, "")}/analyze`;
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const text = await r.text();
      logger.warn("ML core error", { status: r.status, text });
      throw new HttpError(502, "ML core unavailable or returned an error");
    }
    return (await r.json()) as AnalysisResult;
  } catch (e) {
    if (e instanceof HttpError) throw e;
    logger.error("ML fetch failed", e);
    throw new HttpError(502, "Could not reach ML core");
  }
}
