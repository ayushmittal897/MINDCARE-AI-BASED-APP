import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import path from "node:path";

config({ path: path.resolve(process.cwd(), "../../.env") });
config({ path: path.resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Please provide the email of the account to elevate to admin.");
    console.error("Usage: npx tsx make_admin.ts <email>");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User with email ${email} not found.`);
    process.exit(1);
  }

  await prisma.user.update({
    where: { email },
    data: { role: "admin" },
  });

  console.log(`Successfully elevated ${email} to admin.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
