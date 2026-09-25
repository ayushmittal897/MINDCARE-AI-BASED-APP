import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { z } from "zod";
import { validateBody } from "../middleware/validate.js";
import { rateLimit } from "../middleware/rateLimit.js";
import { prisma } from "../db.js";
import { HttpError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { requireAuth } from "../middleware/auth.js";
import { sendOTPEmail } from "../utils/mailer.js";
import { OAuth2Client } from "google-auth-library";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const googleLoginSchema = z.object({
  token: z.string(),
});

const registerSchema = loginSchema.extend({
  name: z.string().optional(),
  role: z.enum(["patient", "clinician", "pending_clinician", "admin"]).optional(),
  credentialsInfo: z.string().optional(),
});

const verifyEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  newPassword: z.string().min(6),
});

export const authRouter = Router();

function signToken(userId: string, email: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new HttpError(500, "JWT_SECRET not configured");
  const expiresInSec = 7 * 24 * 3600;
  const options: SignOptions = { expiresIn: expiresInSec };
  const accessToken = jwt.sign({ sub: userId, email }, secret, options);
  return { accessToken, expiresIn: expiresInSec };
}

function generatePatientId(name?: string, email?: string) {
  let baseStr = name || (email ? email.split('@')[0] : "USER");
  baseStr = baseStr.replace(/[^A-Za-z]/g, '').toUpperCase();
  if (baseStr.length === 0) baseStr = "USER";
  const prefix = baseStr.substring(0, 4).padEnd(4, 'X');
  const uniqueNum = Math.floor(100000 + Math.random() * 900000).toString();
  return `${prefix}${uniqueNum}`;
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

authRouter.post("/register", rateLimit(), validateBody(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name, role, credentialsInfo } = req.body as z.infer<typeof registerSchema>;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return next(new HttpError(409, "Email already registered"));
    const passwordHash = await bcrypt.hash(password, 12);
    
    let userRole = role || "patient";
    let isApproved = true;
    
    const superAdmin = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
    if (superAdmin && email.toLowerCase() === superAdmin) {
      userRole = "admin";
    } else if (userRole === "clinician" || userRole === "admin") {
       userRole = "patient"; // Security fallback: don't allow direct signup as clinician/admin
    }
    
    if (userRole === "pending_clinician") {
      isApproved = false;
    }
    
    const patientId = generatePatientId(name, email);
    
    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await prisma.user.create({
      data: { 
        email, 
        passwordHash, 
        name, 
        role: userRole, 
        isApproved, 
        patientId,
        otp,
        otpExpiresAt
      },
    });

    if (userRole === "pending_clinician") {
      await prisma.doctorRequest.create({
        data: {
          userId: user.id,
          fullName: name || email.split("@")[0],
          email: user.email,
          credentialsInfo: credentialsInfo || "Provided during registration",
        }
      });
    }

    await sendOTPEmail(user.email, otp, "verification");

    res.status(201).json({
      message: userRole === "pending_clinician" 
        ? "Registration successful. Your account is under review. You'll be notified once approved."
        : "Registration successful. Please check your email for the verification code.",
      requiresEmailVerification: true,
      pendingApproval: userRole === "pending_clinician"
    });
  } catch (e) {
    logger.error(e);
    next(new HttpError(500, "Registration failed"));
  }
});

authRouter.post("/login", rateLimit(), validateBody(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return next(new HttpError(401, "Invalid credentials"));
    const ok = user.passwordHash ? await bcrypt.compare(password, user.passwordHash) : false;
    if (!ok) return next(new HttpError(401, "Invalid credentials"));

    if (!user.isEmailVerified) {
      const otp = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await prisma.user.update({
        where: { id: user.id },
        data: { otp, otpExpiresAt }
      });
      await sendOTPEmail(user.email, otp, "verification");
      
      return res.status(403).json({
        requiresEmailVerification: true,
        message: "Please verify your email address. A new code has been sent."
      });
    }

    if (!user.isApproved) {
      const latestRequest = await prisma.doctorRequest.findFirst({
        where: { userId: user.id },
        orderBy: { requestedAt: "desc" }
      });
      if (latestRequest && latestRequest.status === "rejected") {
        const msg = latestRequest.reviewerNote 
          ? `Your account was rejected: ${latestRequest.reviewerNote}` 
          : "Your account registration was rejected by an administrator.";
        return next(new HttpError(403, msg));
      }
      return next(new HttpError(403, "Your account is pending administrator approval."));
    }

    const tokens = signToken(user.id, user.email);
    res.json({
      ...tokens,
      user: { id: user.id, patientId: user.patientId, email: user.email, name: user.name ?? undefined, role: user.role, isApproved: user.isApproved, createdAt: user.createdAt.toISOString() },
    });
  } catch (e) {
    logger.error(e);
    next(new HttpError(500, "Login failed"));
  }
});

authRouter.post("/verify-email", rateLimit(), validateBody(verifyEmailSchema), async (req, res, next) => {
  try {
    const { email, otp } = req.body as z.infer<typeof verifyEmailSchema>;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return next(new HttpError(404, "User not found"));

    if (user.isEmailVerified) return res.json({ message: "Email already verified" });

    if (user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return next(new HttpError(400, "Invalid or expired verification code"));
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { isEmailVerified: true, otp: null, otpExpiresAt: null }
    });

    const tokens = signToken(user.id, user.email);
    res.json({
      ...tokens,
      user: { id: user.id, patientId: user.patientId, email: user.email, name: user.name ?? undefined, role: user.role, isApproved: user.isApproved, createdAt: user.createdAt.toISOString() },
    });
  } catch (e) {
    logger.error(e);
    next(new HttpError(500, "Verification failed"));
  }
});

const resendOtpSchema = z.object({
  email: z.string().email(),
});

authRouter.post("/resend-otp", rateLimit(), validateBody(resendOtpSchema), async (req, res, next) => {
  try {
    const { email } = req.body as z.infer<typeof resendOtpSchema>;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return next(new HttpError(404, "User not found"));

    if (user.isEmailVerified) return res.json({ message: "Email already verified" });

    // Enforce 30s cooldown on the backend as well
    if (user.otpExpiresAt) {
      const msSinceLastOtp = 10 * 60 * 1000 - (user.otpExpiresAt.getTime() - Date.now());
      if (msSinceLastOtp < 30000) {
        return next(new HttpError(429, "Please wait before requesting a new code"));
      }
    }

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiresAt }
    });

    await sendOTPEmail(user.email, otp, "verification");

    res.json({ message: "Verification code resent." });
  } catch (e) {
    logger.error(e);
    next(new HttpError(500, "Failed to resend OTP"));
  }
});

authRouter.post("/forgot-password", rateLimit(), validateBody(forgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body as z.infer<typeof forgotPasswordSchema>;
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) return res.json({ message: "If that email exists, a code has been sent." });

    const otp = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiresAt }
    });

    await sendOTPEmail(user.email, otp, "reset");
    
    res.json({ message: "If that email exists, a code has been sent." });
  } catch (e) {
    logger.error(e);
    next(new HttpError(500, "Forgot password request failed"));
  }
});

authRouter.post("/reset-password", rateLimit(), validateBody(resetPasswordSchema), async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body as z.infer<typeof resetPasswordSchema>;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return next(new HttpError(400, "Invalid request"));

    if (user.otp !== otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return next(new HttpError(400, "Invalid or expired reset code"));
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, otp: null, otpExpiresAt: null }
    });

    res.json({ message: "Password has been successfully reset" });
  } catch (e) {
    logger.error(e);
    next(new HttpError(500, "Password reset failed"));
  }
});

authRouter.post("/google", rateLimit(), validateBody(googleLoginSchema), async (req, res, next) => {
  try {
    const { token } = req.body as z.infer<typeof googleLoginSchema>;
    
    // 1. Verify the Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return next(new HttpError(401, "Invalid Google token"));
    }
    
    const email = payload.email;
    const name = payload.name || "Google User";
    
    // 2. Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      const patientId = generatePatientId(name, email);
      
      const superAdmin = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
      const isAdmin = superAdmin ? email.toLowerCase() === superAdmin : false;
      
      user = await prisma.user.create({
        data: {
          email,
          name,
          role: isAdmin ? "admin" : "patient",
          isApproved: true,
          patientId,
          isEmailVerified: true
        },
      });
    }

    if (!user.isApproved) {
      const latestRequest = await prisma.doctorRequest.findFirst({
        where: { userId: user.id },
        orderBy: { requestedAt: "desc" }
      });
      if (latestRequest && latestRequest.status === "rejected") {
        const msg = latestRequest.reviewerNote 
          ? `Your account was rejected: ${latestRequest.reviewerNote}` 
          : "Your account registration was rejected by an administrator.";
        return next(new HttpError(403, msg));
      }
      return next(new HttpError(403, "Your account is pending administrator approval."));
    }

    // 3. Issue JWT
    const tokens = signToken(user.id, user.email);
    res.json({
      ...tokens,
      user: {
        id: user.id,
        patientId: user.patientId,
        email: user.email,
        name: user.name ?? undefined,
        role: user.role,
        isApproved: user.isApproved,
        createdAt: user.createdAt.toISOString()
      },
    });
  } catch (e) {
    logger.error("Google login error:", e);
    next(new HttpError(401, "Google authentication failed"));
  }
});

authRouter.post("/request-clinician-access", requireAuth, rateLimit(), async (req, res, next) => {
  try {
    if (!req.user?.sub) return next(new HttpError(401, "Unauthorized"));
    
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) return next(new HttpError(404, "User not found"));
    
    if (user.role === "clinician" || user.role === "admin") {
      return res.json({ message: "You already have advanced privileges." });
    }
    
    if (user.role === "pending_clinician") {
      return res.json({ message: "You already have a pending clinician request." });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { role: "pending_clinician" }
      });
      
      await tx.doctorRequest.create({
        data: {
          userId: user.id,
          fullName: user.name || user.email.split("@")[0],
          email: user.email,
          credentialsInfo: req.body.credentialsInfo || "Requested via in-app upgrade",
        }
      });
    });

    res.json({ message: "Your request for clinician access has been submitted." });
  } catch (e) {
    logger.error("Failed to request clinician access:", e);
    next(new HttpError(500, "Failed to submit request"));
  }
});
authRouter.post("/logout", (_req, res) => {
  res.json({ ok: true });
});

authRouter.post("/refresh", (_req, _res, next) => {
  next(new HttpError(501, "Refresh not implemented in scaffold"));
});
