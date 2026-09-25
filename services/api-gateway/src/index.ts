import "./env.js";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { analysisRouter } from "./routes/analysis.js";
import { authRouter } from "./routes/auth.js";
import { reportsRouter } from "./routes/reports.js";
import screeningRouter from "./routes/screening.js";
import { sessionsRouter } from "./routes/sessions.js";
import { errorHandler } from "./utils/errors.js";
import { logger } from "./utils/logger.js";
import { adminRouter } from "./routes/admin.js";
import { prisma } from "./db.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(helmet());
const dev = process.env.NODE_ENV !== "production";
app.use(
  cors({
    // Dev: allow any localhost port so Vite can fall back if `VITE_DEV_PORT` is taken.
    origin: dev ? true : (process.env.CORS_ORIGIN ?? "http://localhost:5173"),
    credentials: true,
  }),
);
app.use(express.json({ limit: "12mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "mindcare-api-gateway" });
});

app.use("/auth", authRouter);
app.use("/analysis", analysisRouter);
app.use("/sessions", sessionsRouter);
app.use("/reports", reportsRouter);
app.use("/screening", screeningRouter);
app.use("/admin", adminRouter);

app.get("/flags", async (_req, res, next) => {
  try {
    const flags = await prisma.featureFlag.findMany();
    res.json(flags);
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Backend service READY on port ${port}`);
});
