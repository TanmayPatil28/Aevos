import 'dotenv/config';
import { prisma } from './lib/prisma';
async function main() {
  const courses = await prisma.course.findMany({
    include: { enrollments: true }
  });
  console.log(JSON.stringify(courses, null, 2));
}
main().catch(console.error);
