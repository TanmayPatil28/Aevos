import { prisma } from './lib/prisma';
async function run() {
  await prisma.$executeRawUnsafe(`
    UPDATE storage.buckets SET public = true WHERE id = 'documents';
  `);
  console.log('Bucket made public!');
}
run().finally(() => prisma.$disconnect());
