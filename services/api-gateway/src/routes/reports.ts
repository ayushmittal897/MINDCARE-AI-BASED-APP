import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../db.js";
import { HttpError } from "../utils/errors.js";

export const reportsRouter = Router();

reportsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    console.log("[reportsRouter] GET /reports for userId:", userId);
    if (!userId) return next(new HttpError(401, "Unauthorized"));
    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      include: { predictions: { orderBy: { probability: "desc" }, take: 1 }, reports: true },
    });
    console.log("[reportsRouter] Found sessions count:", sessions.length);

    const history = sessions.map((s) => ({
      id: s.id,
      displayId: s.displayId,
      userId: s.userId,
      startedAt: s.startedAt.toISOString(),
      endedAt: s.endedAt?.toISOString(),
      topPrediction: s.predictions[0]?.label,
      type: s.reports[0]?.screeningJson ? "screening" : "session",
    }));

    res.json(history);
  } catch (e) {
    next(e);
  }
});

reportsRouter.get("/:sessionId", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return next(new HttpError(401, "Unauthorized"));
    const session = await prisma.session.findFirst({
      where: { 
        OR: [{ id: req.params.sessionId }, { displayId: req.params.sessionId }], 
        userId 
      },
      include: { 
        reports: { orderBy: { createdAt: "desc" }, take: 1 },
        predictions: { orderBy: { probability: "desc" } }
      },
    });
    if (!session?.reports[0]) return next(new HttpError(404, "Report not found"));
    const r = session.reports[0];
    const topPrediction = session.predictions[0]?.label ?? "Healthy";
    
    res.json({
      sessionId: session.id,
      displayId: session.displayId,
      prediction: r.prediction || topPrediction,
      probabilities: r.predictionsJson || session.predictions.map(p => ({ label: p.label, probability: p.probability })),
      confidences: r.confidencesJson ?? { cA: 0, cV: 0, cL: 0 },
      weights: r.weightsJson ?? { wA: 0, wV: 0, wL: 0 },
      shapRankings: r.shapJson ?? [],
      userSummary: r.userSummary ?? "",
      medicalSummary: r.medicalSummary ?? "",
      createdAt: r.createdAt.toISOString(),
      inputs: r.inputsJson ? { ...(r.inputsJson as object), sentAt: r.createdAt.toISOString() } : undefined,
      screeningResult: r.screeningJson ? r.screeningJson : undefined,
    });
  } catch (e) {
    next(e);
  }
});

import { sendAssessmentEmail } from "../utils/mailer.js";
import { z } from "zod";
import { validateBody } from "../middleware/validate.js";

const emailPdfSchema = z.object({
  pdfBase64: z.string()
});

reportsRouter.post("/email-result", requireAuth, validateBody(emailPdfSchema), async (req, res, next) => {
  try {
    const email = req.user?.email;
    if (!email) return next(new HttpError(400, "User email not found"));
    
    const { pdfBase64 } = req.body as z.infer<typeof emailPdfSchema>;
    
    await sendAssessmentEmail(email, pdfBase64);
    res.json({ ok: true, message: "Email sent successfully" });
  } catch (e) {
    next(e);
  }
});
