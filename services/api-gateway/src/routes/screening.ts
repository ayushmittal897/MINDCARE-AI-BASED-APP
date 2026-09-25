import type { ScreeningRequest, ScreeningResult } from "@mindcare/types";
import { Router, Request, Response } from "express";
import { prisma } from "../db.js";
import { logger } from "../utils/logger.js";
import { requireAuth } from "../middleware/auth.js";
import { calculateDomainScores, generateMultimodalContributions, getInterpretation } from "../services/scoring.js";
import { generateScreeningInsights } from "../services/gemini.js";
import { createSessionWithRetry } from "../utils/session.js";

const router = Router();

router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const data = req.body as ScreeningRequest;

    if (!data.answers || data.answers.length === 0) {
      return res.status(400).json({ error: "At least one questionnaire answer is required" });
    }

    // 1. Calculate deterministic domain scores
    const { domains, overallScore, safetyTriggered } = calculateDomainScores(data.answers);

    // 2. Multimodal Fusion
    const multimodal = generateMultimodalContributions(data, overallScore);

    // 3. Generate structured natural-language explanation via Gemini
    const insights = await generateScreeningInsights(domains, overallScore);

    // Create session for tracking
    const session = await createSessionWithRetry(userId);

    const timestamp = new Date().toISOString();

    const result: ScreeningResult = {
      sessionId: session.id,
      displayId: session.displayId,
      timestamp,
      questionnaire: {
        totalQuestions: 40,
        answeredQuestions: data.answers.length,
        answers: data.answers,
        domainScores: domains,
      },
      multimodal: {
        questionnaireWeight: multimodal.questionnaireWeight,
        linguisticWeight: multimodal.linguisticWeight,
        acousticWeight: multimodal.acousticWeight,
        visualWeight: multimodal.visualWeight,
        contributions: multimodal.contributions,
      },
      screeningIndex: {
        score: overallScore,
        interpretation: getInterpretation(overallScore),
      },
      domains,
      keyFactors: insights.keyFactors,
      signalAgreement: multimodal.signalAgreement,
      safety: {
        triggered: safetyTriggered,
        status: safetyTriggered ? "Safety check triggered due to critical response." : "OK",
      },
      summary: insights.summary,
      recommendations: insights.recommendations,
      researchSources: [
        { title: "PHQ-9 Depression Severity", url: "https://www.apa.org/pi/about/publications/caregivers/practice-settings/assessment/tools/patient-health" },
        { title: "GAD-7 Anxiety", url: "https://adaa.org/understanding-anxiety/gad-7-questionnaire" },
        { title: "WHO-5 Well-being", url: "https://www.who.int/publications/i/item/who-5-well-being-index" }
      ],
      disclaimer: "This result is a research-informed screening summary and is not a medical diagnosis. It should not replace assessment by a qualified healthcare professional.",
    };

    // Store the report
    await prisma.report.create({
      data: {
        sessionId: session.id,
        userSummary: insights.summary,
        medicalSummary: "Screening assessment completed.",
        screeningJson: JSON.parse(JSON.stringify(result)), // store exactly as structured
      },
    });

    res.json(result);
  } catch (error) {
    logger.error("Error processing screening:", error);
    res.status(500).json({ error: "Internal server error during screening analysis" });
  }
});

export default router;
