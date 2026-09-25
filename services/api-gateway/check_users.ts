import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: {
      email: true,
      patientId: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 5
  });

  console.log("=== Recent Users Report ===");
  if (users.length === 0) {
    console.log("No users found in the database.");
  } else {
    users.forEach((u, i) => {
      console.log(`${i + 1}. Email: ${u.email}`);
      console.log(`   Patient ID: ${u.patientId} (Length: ${u.patientId.length} digits)`);
      console.log(`   Created At: ${u.createdAt}`);
      console.log('---------------------------');
    });
  }
}

main()
  .catch(e => {
    console.error("Error connecting to database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
