import { GoogleGenAI, Type } from "@google/genai";
import { logger } from "../utils/logger.js";
import type { ScreeningDomainScore } from "@mindcare/types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy-key" });

interface GeminiScreeningResponse {
  summary: string;
  recommendations: string[];
  keyFactors: { feature: string; contribution: number }[];
}

export async function generateScreeningInsights(
  domains: Record<string, ScreeningDomainScore>,
  overallScore: number
): Promise<GeminiScreeningResponse> {
  if (!process.env.GEMINI_API_KEY) {
    logger.warn("GEMINI_API_KEY not set, using fallback generation");
    return generateFallbackInsights(domains, overallScore);
  }

  const prompt = `
You are a highly capable AI assistant helping to explain a deterministic mental wellness screening.
The screening uses 40 questions covering domains like Mood, Anxiety, Stress, Sleep, etc.
We have already calculated the scores deterministically.

Given the following domain scores (0-100, where higher is generally more concerning):
${JSON.stringify(domains, null, 2)}
Overall Screening Score: ${overallScore}/100

Please provide a structured response containing:
1. "summary": A personalized summary (max 3 sentences) highlighting the top areas of concern and any strong positive areas. Do NOT invent symptoms, diagnoses, or life events. Only use the provided domain data.
2. "recommendations": An array of 3-5 general, low-risk wellness suggestions based on the highest scoring domains (e.g., if sleep is high, suggest consistent sleep schedules). DO NOT prescribe or diagnose.
3. "keyFactors": An array of up to 6 key factors (feature name and a numerical contribution between -0.3 and 0.3) that represent the biggest drivers of the score for SHAP-style explainability visualization. Positive contributions drive the score higher (concerning), negative drive it lower (protective).

Output MUST be strictly JSON matching the requested schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            keyFactors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  feature: { type: Type.STRING },
                  contribution: { type: Type.NUMBER },
                },
                required: ["feature", "contribution"],
              },
            },
          },
          required: ["summary", "recommendations", "keyFactors"],
        },
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text) as GeminiScreeningResponse;
      return data;
    }
  } catch (error) {
    logger.error("Gemini API error during screening generation:", error);
  }

  return generateFallbackInsights(domains, overallScore);
}

function generateFallbackInsights(
  domains: Record<string, ScreeningDomainScore>,
  _overallScore: number
): GeminiScreeningResponse {
  const sorted = Object.values(domains).sort((a, b) => b.score - a.score);
  const topConcerns = sorted.slice(0, 3).map((d) => d.domain);
  const positives = sorted.slice(-2).map((d) => d.domain);

  return {
    summary: `Your responses show the highest reported concerns in ${topConcerns.join(", ")}. Indicators for ${positives.join(" and ")} were comparatively stronger.`,
    recommendations: [
      "Maintain a consistent daily routine.",
      "Consider structured breaks and relaxation exercises.",
      "Monitor whether difficulties persist over time.",
    ],
    keyFactors: [
      { feature: topConcerns[0] || "Stress", contribution: 0.24 },
      { feature: topConcerns[1] || "Anxiety", contribution: 0.18 },
      { feature: positives[0] || "Social", contribution: -0.1 },
    ],
  };
}
