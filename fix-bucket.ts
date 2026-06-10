import { prisma } from './lib/prisma';
async function run() {
  console.log("Updating storage.buckets config...");
  await prisma.$executeRawUnsafe(`
    UPDATE storage.buckets 
    SET allowed_mime_types = ARRAY['application/pdf', 'text/plain', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword']
    WHERE id = 'documents';
  `);
  console.log("Success! Bucket updated.");
}
run().finally(() => prisma.$disconnect());
