import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db.js";
import { validateBody } from "../middleware/validate.js";
import { requireAuth } from "../middleware/auth.js";
import { HttpError } from "../utils/errors.js";

export const adminRouter = Router();

// Middleware to check if user is admin
const requireAdmin = async (req: any, _res: any, next: any) => {
  if (!req.user) {
    return next(new HttpError(401, "Unauthorized"));
  }

  try {
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    if (adminEmails.includes(req.user.email.toLowerCase())) {
      return next();
    }

    const dbUser = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (dbUser?.role === "admin") {
      return next();
    }

    return next(new HttpError(403, "Forbidden: Admin access required"));
  } catch (error) {
    return next(new HttpError(500, "Internal Server Error"));
  }
};

adminRouter.use(requireAuth);
adminRouter.use(requireAdmin);

// Feature Flags
adminRouter.get("/feature-flags", async (_req, res, next) => {
  try {
    const defaultFlags = [
      { flagKey: "session_tab", enabled: true, description: "Enable the Session tab for non-admin users" }
    ];

    // Ensure default flags exist
    for (const df of defaultFlags) {
      await prisma.featureFlag.upsert({
        where: { flagKey: df.flagKey },
        update: {},
        create: { flagKey: df.flagKey, enabled: df.enabled }
      });
    }

    const flags = await prisma.featureFlag.findMany({
      orderBy: { flagKey: "asc" }
    });
    res.json(flags);
  } catch (error) {
    next(error);
  }
});

const updateFlagSchema = z.object({
  enabled: z.boolean(),
});

adminRouter.patch("/feature-flags/:key", validateBody(updateFlagSchema), async (req, res, next) => {
  try {
    const { key } = req.params;
    const { enabled } = req.body;
    const flag = await prisma.featureFlag.upsert({
      where: { flagKey: key },
      update: { enabled },
      create: { flagKey: key, enabled }
    });
    res.json(flag);
  } catch (error) {
    next(error);
  }
});

// Doctor Requests
adminRouter.get("/doctor-requests", async (_req, res, next) => {
  try {
    const requests = await prisma.doctorRequest.findMany({
      where: { status: "pending" },
      orderBy: { requestedAt: "asc" },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });
    res.json(requests);
  } catch (error) {
    next(error);
  }
});

const processRequestSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reviewerNote: z.string().optional(),
});

adminRouter.post("/doctor-requests/:id/process", validateBody(processRequestSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reviewerNote } = req.body;
    
    const request = await prisma.doctorRequest.findUnique({ where: { id } });
    if (!request) {
      return next(new HttpError(404, "Doctor request not found"));
    }
    
    if (request.status !== "pending") {
      return next(new HttpError(400, "Request is already processed"));
    }

    const updatedRequest = await prisma.$transaction(async (tx) => {
      const updated = await tx.doctorRequest.update({
        where: { id },
        data: {
          status: action === "approve" ? "approved" : "rejected",
          reviewerNote,
          reviewedAt: new Date(),
        }
      });
      
      const userToApprove = await tx.user.findUnique({ where: { id: request.userId } });
      
      if (action === "approve") {
        const newRole = userToApprove?.role === "pending_clinician" ? "clinician" : userToApprove?.role;
        await tx.user.update({
          where: { id: request.userId },
          data: { role: newRole, isApproved: true }
        });
      } else {
         await tx.user.update({
          where: { id: request.userId },
          data: { role: "patient", isApproved: true }
        });
      }
      
      return updated;
    });

    res.json({ message: `Request ${action}d successfully`, request: updatedRequest });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/grant-admin", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new HttpError(400, "Email is required"));
    
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return next(new HttpError(404, "No account with that email exists"));
    }
    
    if (user.role === "admin") {
      return res.json({ message: `${user.name || email} is already an admin` });
    }
    
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { role: "admin", isApproved: true, adminGrantedAt: new Date() },
    });
    
    res.json({ message: `${user.name || email} is now an admin` });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/admins", async (_req, res, next) => {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { id: true, email: true, name: true, adminGrantedAt: true },
      orderBy: { adminGrantedAt: "desc" }
    });
    res.json(admins);
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/revoke-admin", async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(new HttpError(400, "Email is required"));
    
    // Prevent self-revocation
    if (req.user?.email.toLowerCase() === email.toLowerCase()) {
      return next(new HttpError(400, "You cannot revoke your own admin access"));
    }
    
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return next(new HttpError(404, "No account with that email exists"));
    }
    
    if (user.role !== "admin") {
      return res.json({ message: `${user.name || email} is not an admin` });
    }
    
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { role: "patient", adminGrantedAt: null },
    });
    
    res.json({ message: `${user.name || email}'s admin access has been revoked` });
  } catch (error) {
    next(error);
  }
});
