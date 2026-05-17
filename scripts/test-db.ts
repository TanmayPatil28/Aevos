import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing Prisma connection...');
    const userCount = await prisma.user.count();
    console.log('SUCCESS: Connected to database.');
    console.log(`Current user count: ${userCount}`);
  } catch (error) {
    console.error('FAILURE: Could not connect to database.');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
