const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.careerProfile.findFirst().then(profile => {
  console.log('CareerProfile from DB:', profile);
  return prisma.$disconnect();
});
