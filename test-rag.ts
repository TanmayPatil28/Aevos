import { retrieveMemories } from './lib/ai/memory';
import { prisma } from './lib/prisma';

async function test() {
  const docs = await prisma.document.findMany();
  console.log("Documents in DB:", docs);

  const memories = await prisma.$queryRaw`SELECT id, content FROM user_memories`;
  console.log("Memories in DB count:", (memories as any[]).length);
  
  if ((memories as any[]).length > 0) {
    console.log("First memory:", (memories as any[])[0]);
  }
}

test().catch(console.error);
