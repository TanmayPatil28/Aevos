import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  try {
    const user = await prisma.user.upsert({
      where: { id: "test-uuid-1234" },
      update: {
        isOnboarded: true,
        university: "jspm",
        name: "Test User",
      },
      create: {
        id: "test-uuid-1234",
        email: "test@example.com",
        name: "Test User",
        university: "jspm",
        isOnboarded: true,
      }
    });
    console.log("Success:", user.id);
  } catch (e) {
    console.error("Prisma error:", e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
