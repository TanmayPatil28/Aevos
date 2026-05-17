/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const COMPANIES = [
  { name: 'Google', category: 'dream', minCgpa: 8.5, sector: 'Product', avgPackage: '30+ LPA' },
  { name: 'Microsoft', category: 'dream', minCgpa: 8.0, sector: 'Product', avgPackage: '40+ LPA' },
  { name: 'Amazon', category: 'dream', minCgpa: 8.0, sector: 'Product', avgPackage: '35+ LPA' },
  { name: 'Atlassian', category: 'dream', minCgpa: 8.5, sector: 'Product', avgPackage: '50+ LPA' },
  {
    name: 'Goldman Sachs',
    category: 'dream',
    minCgpa: 8.0,
    sector: 'Finance',
    avgPackage: '24+ LPA',
  },

  { name: 'Barclays', category: 'target', minCgpa: 7.5, sector: 'Finance', avgPackage: '14+ LPA' },
  {
    name: 'Mastercard',
    category: 'target',
    minCgpa: 7.5,
    sector: 'Product',
    avgPackage: '18+ LPA',
  },
  { name: 'Siemens', category: 'target', minCgpa: 7.0, sector: 'Core', avgPackage: '10+ LPA' },
  {
    name: 'Cisco',
    category: 'target',
    minCgpa: 7.5,
    sector: 'Hardware/Networking',
    avgPackage: '16+ LPA',
  },
  {
    name: 'Samsung',
    category: 'target',
    minCgpa: 7.5,
    sector: 'Product/R&D',
    avgPackage: '14+ LPA',
  },

  { name: 'TCS', category: 'safe', minCgpa: 6.0, sector: 'IT Services', avgPackage: '4-7 LPA' },
  { name: 'Infosys', category: 'safe', minCgpa: 6.0, sector: 'IT Services', avgPackage: '4-8 LPA' },
  { name: 'Wipro', category: 'safe', minCgpa: 6.0, sector: 'IT Services', avgPackage: '4-6 LPA' },
  {
    name: 'Accenture',
    category: 'safe',
    minCgpa: 6.5,
    sector: 'Consulting',
    avgPackage: '4.5-12 LPA',
  },
  {
    name: 'Cognizant',
    category: 'safe',
    minCgpa: 6.0,
    sector: 'IT Services',
    avgPackage: '4-6.5 LPA',
  },
];

async function main() {
  console.log('Seeding Placement Data...');

  for (const company of COMPANIES) {
    await prisma.company.upsert({
      where: { name: company.name },
      update: company,
      create: company,
    });
  }

  console.log('Seed Complete. Total standard companies:', COMPANIES.length);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
