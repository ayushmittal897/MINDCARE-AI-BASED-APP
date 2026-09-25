import type { NextFunction, Request, Response } from "express";
import { logger } from "./logger.js";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }
  logger.error("Unhandled error", err);
  return res.status(500).json({ message: "Internal server error" });
}
