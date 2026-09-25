import { prisma } from "../db.js";

function generateLetters(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateNumbers(length: number): string {
  const chars = "0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateSessionCode(): string {
  return `SES-${generateLetters(4)}-${generateNumbers(6)}`;
}

export async function createSessionWithRetry(userId: string, retries = 5) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  for (let i = 0; i < retries; i++) {
    const displayId = `${user.patientId}-SES-${generateNumbers(4)}`;
    try {
      const session = await prisma.session.create({
        data: {
          userId,
          displayId,
        },
      });
      return session;
    } catch (e: any) {
      if (e.code === "P2002") {
        console.warn(`Session ID collision for ${displayId}, retrying (${i + 1}/${retries})...`);
        continue;
      }
      throw e;
    }
  }
  throw new Error("Failed to generate a unique session ID after 5 attempts.");
}
