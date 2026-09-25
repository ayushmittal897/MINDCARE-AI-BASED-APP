import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { HttpError } from "../utils/errors.js";

import { logger } from "../utils/logger.js";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      logger.error("Validation error", parsed.error);
      return next(new HttpError(400, "Invalid request data. Please check your inputs."));
    }
    req.body = parsed.data;
    next();
  };
}
