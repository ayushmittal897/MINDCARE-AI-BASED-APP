import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../db.js";
import { HttpError } from "../utils/errors.js";

export const sessionsRouter = Router();

sessionsRouter.get("/", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return next(new HttpError(401, "Unauthorized"));
    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { startedAt: "desc" },
      take: 50,
      include: { predictions: { orderBy: { probability: "desc" }, take: 1 } },
    });
    type Row = (typeof sessions)[number];
    res.json(
      sessions.map((s: Row) => ({
        id: s.id,
        userId: s.userId,
        startedAt: s.startedAt.toISOString(),
        endedAt: s.endedAt?.toISOString(),
        topPrediction: s.predictions[0]?.label,
      })),
    );
  } catch (e) {
    next(e);
  }
});

sessionsRouter.delete("/", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return next(new HttpError(401, "Unauthorized"));
    await prisma.session.deleteMany({
      where: { userId },
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

sessionsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return next(new HttpError(401, "Unauthorized"));
    const session = await prisma.session.findFirst({
      where: { id: req.params.id, userId },
    });
    if (!session) return next(new HttpError(404, "Session not found"));
    await prisma.session.delete({ where: { id: session.id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});
