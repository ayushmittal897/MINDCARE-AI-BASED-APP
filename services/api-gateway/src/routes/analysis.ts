import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { validateBody } from "../middleware/validate.js";
import { prisma } from "../db.js";
import { analyzeMultimodal } from "../mlClient.js";
import { HttpError } from "../utils/errors.js";
import { createSessionWithRetry } from "../utils/session.js";

const sessionSchema = z.object({
  transcript: z.string().optional(),
  audioBase64: z.string().optional(),
  videoBase64: z.string().optional(),
});

export const analysisRouter = Router();

analysisRouter.post(
  "/session",
  requireAuth,
  rateLimit({ max: 20 }),
  validateBody(sessionSchema),
  async (req, res, next) => {
    try {
      const userId = req.user?.sub;
      if (!userId) return next(new HttpError(401, "Unauthorized"));
      const body = req.body as z.infer<typeof sessionSchema>;
      const session = await createSessionWithRetry(userId);
      const result = await analyzeMultimodal({ ...body, userId });
      result.sessionId = session.id;
      result.displayId = session.displayId;

      await prisma.prediction.createMany({
        data: result.probabilities.map((p) => ({
          sessionId: session.id,
          label: p.label,
          probability: p.probability,
        })),
      });

      await prisma.report.create({
        data: {
          sessionId: session.id,
          prediction: result.prediction,
          userSummary: result.userSummary,
          medicalSummary: result.medicalSummary,
          shapJson: result.shapRankings as unknown as object[],
          weightsJson: result.weights as unknown as object,
          confidencesJson: result.confidences as unknown as object,
          predictionsJson: result.probabilities as unknown as object[],
          inputsJson: {
            transcriptText: body.transcript || "",
            transcriptChars: body.transcript?.length || 0,
            hasAudio: !!body.audioBase64,
            audioKb: body.audioBase64 ? Math.round((body.audioBase64.length * 0.75) / 1024) : 0,
            hasVideoFrame: !!body.videoBase64,
            videoFrameBase64: body.videoBase64 || null,
          }
        },
      });

      res.json(result);
    } catch (e) {
      next(e);
    }
  },
);
