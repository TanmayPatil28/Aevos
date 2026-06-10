import { prisma } from './lib/prisma';
async function run() {
  const result = await prisma.$queryRawUnsafe(`
    SELECT column_name, column_default, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'user_memories';
  `);
  console.log(result);
}
run().finally(() => prisma.$disconnect());
