import { config } from "dotenv";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

config({ path: path.resolve(process.cwd(), "../../.env") });
config({ path: path.resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

async function main() {
  const password = "demo-demo";
  const passwordHash = await bcrypt.hash(password, 12);

  const clinicianEmail = "clinician@mindcare.local";
  const existingClinician = await prisma.user.findUnique({ where: { email: clinicianEmail } });
  if (!existingClinician) {
    await prisma.user.create({
      data: { email: clinicianEmail, passwordHash, name: "Demo Clinician", role: "clinician", isApproved: true, patientId: "CLIN0001" },
    });
    console.log("Seeded clinician:", clinicianEmail, "/", password);
  }

  const patientEmail = "patient@mindcare.local";
  const existingPatient = await prisma.user.findUnique({ where: { email: patientEmail } });
  if (!existingPatient) {
    await prisma.user.create({
      data: { email: patientEmail, passwordHash, name: "Demo Patient", role: "patient", isApproved: true, patientId: "PATI0001" },
    });
    console.log("Seeded patient:", patientEmail, "/", password);
  }

  // Seed Feature Flags
  await prisma.featureFlag.upsert({
    where: { flagKey: 'session_tab_enabled' },
    update: {},
    create: {
      flagKey: 'session_tab_enabled',
      enabled: false,
    },
  });

  await prisma.featureFlag.upsert({
    where: { flagKey: 'clinical_assessment_enabled' },
    update: {},
    create: {
      flagKey: 'clinical_assessment_enabled',
      enabled: true,
    },
  });

  console.log("Seeded feature flags.");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
