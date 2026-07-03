import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.timetableSlot.count();
  console.log(`Total TimetableSlots in DB: ${count}`);
  
  if (count > 0) {
    const slots = await prisma.timetableSlot.findMany({ take: 5 });
    console.log(slots);
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
