import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "../utils/errors.js";

export interface AuthPayload {
  sub: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) {
    return next(new HttpError(401, "Unauthorized"));
  }
  try {
    const payload = jwt.verify(token, secret) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    next(new HttpError(401, "Invalid token"));
  }
}
