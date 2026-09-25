import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'test@example.com';
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 12);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash, isApproved: true, isEmailVerified: true },
    create: {
      email,
      name: 'Test User',
      passwordHash,
      role: 'USER',
      isApproved: true,
      isEmailVerified: true,
      patientId: 'TEST-1234'
    }
  });
  console.log('User created:', user.email);
}
main().finally(() => prisma.$disconnect());
