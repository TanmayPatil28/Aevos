import { prisma } from './lib/prisma';

async function run() {
  const count = await prisma.userMemory.count();
  console.log(`Total memories in DB: ${count}`);
  
  if (count > 0) {
    const mems = await prisma.userMemory.findMany({ take: 5, select: { id: true, content: true, userId: true } });
    console.log("Sample memories:", JSON.stringify(mems, null, 2));
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
