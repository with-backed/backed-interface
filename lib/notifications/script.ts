import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/* 
This file can be used as a script to run DB operations should we ever need to in the future (proceed with caution)
run with: npx dotenv -e .env.development -- npx ts-node --skip-project notifications/index.ts
*/

async function main() {
  // await prisma.notificationRequest.count; // returns count of all notification requests
}

main()
  .catch((e) => {
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
