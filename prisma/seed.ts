import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COMPANIES = [
  // Dream Tier
  {
    name: 'Google',
    category: 'dream',
    minCgpa: 8.5,
    avgPackage: 35.0,
    sector: 'Product',
    allowedBranches: ['CSE', 'IT'],
    backlogTolerance: 0,
  },
  {
    name: 'Microsoft',
    category: 'dream',
    minCgpa: 8.0,
    avgPackage: 45.0,
    sector: 'Product',
    allowedBranches: ['CSE', 'IT', 'ECE'],
    backlogTolerance: 0,
  },
  {
    name: 'Amazon',
    category: 'dream',
    minCgpa: 7.5,
    avgPackage: 32.0,
    sector: 'Product',
    allowedBranches: ['CSE', 'IT', 'ECE', 'AIML'],
    backlogTolerance: 0,
  },
  {
    name: 'Goldman Sachs',
    category: 'dream',
    minCgpa: 8.0,
    avgPackage: 28.0,
    sector: 'Finance',
    allowedBranches: ['CSE', 'IT', 'ECE'],
    backlogTolerance: 0,
  },
  {
    name: 'Atlassian',
    category: 'dream',
    minCgpa: 8.5,
    avgPackage: 52.0,
    sector: 'Product',
    allowedBranches: ['CSE', 'IT'],
    backlogTolerance: 0,
  },
  {
    name: 'Adobe',
    category: 'dream',
    minCgpa: 8.0,
    avgPackage: 40.0,
    sector: 'Product',
    allowedBranches: ['CSE', 'IT'],
    backlogTolerance: 0,
  },

  // Target Tier
  {
    name: 'Deloitte',
    category: 'target',
    minCgpa: 7.0,
    avgPackage: 12.0,
    sector: 'Consulting',
    allowedBranches: ['CSE', 'IT', 'ECE', 'AIML'],
    backlogTolerance: 1,
  },
  {
    name: 'TCS Digital',
    category: 'target',
    minCgpa: 7.5,
    avgPackage: 7.5,
    sector: 'IT Services',
    allowedBranches: ['CSE', 'IT', 'ECE', 'AIML'],
    backlogTolerance: 1,
  },
  {
    name: 'Infosys Power Programmer',
    category: 'target',
    minCgpa: 7.5,
    avgPackage: 9.0,
    sector: 'IT Services',
    allowedBranches: ['CSE', 'IT', 'ECE'],
    backlogTolerance: 1,
  },
  {
    name: 'Cognizant GenC Next',
    category: 'target',
    minCgpa: 7.0,
    avgPackage: 6.75,
    sector: 'IT Services',
    allowedBranches: ['CSE', 'IT', 'ECE', 'AIML'],
    backlogTolerance: 1,
  },
  {
    name: 'Capgemini',
    category: 'target',
    minCgpa: 6.5,
    avgPackage: 7.5,
    sector: 'IT Services',
    allowedBranches: ['CSE', 'IT', 'ECE', 'AIML'],
    backlogTolerance: 1,
  },
  {
    name: 'JP Morgan Chase',
    category: 'target',
    minCgpa: 7.5,
    avgPackage: 18.0,
    sector: 'Finance',
    allowedBranches: ['CSE', 'IT', 'ECE'],
    backlogTolerance: 0,
  },
  {
    name: 'Morgan Stanley',
    category: 'target',
    minCgpa: 7.5,
    avgPackage: 22.0,
    sector: 'Finance',
    allowedBranches: ['CSE', 'IT', 'ECE'],
    backlogTolerance: 0,
  },

  // Safe Tier
  {
    name: 'TCS Ninja',
    category: 'safe',
    minCgpa: 6.0,
    avgPackage: 3.5,
    sector: 'IT Services',
    allowedBranches: ['CSE', 'IT', 'ECE', 'AIML', 'MECH', 'CIVIL'],
    backlogTolerance: 2,
  },
  {
    name: 'Wipro',
    category: 'safe',
    minCgpa: 6.0,
    avgPackage: 3.5,
    sector: 'IT Services',
    allowedBranches: ['CSE', 'IT', 'ECE', 'AIML', 'MECH', 'CIVIL'],
    backlogTolerance: 2,
  },
  {
    name: 'Accenture',
    category: 'safe',
    minCgpa: 6.5,
    avgPackage: 4.5,
    sector: 'Consulting',
    allowedBranches: ['CSE', 'IT', 'ECE', 'AIML', 'MECH', 'CIVIL'],
    backlogTolerance: 2,
  },
  {
    name: 'Infosys System Engineer',
    category: 'safe',
    minCgpa: 6.0,
    avgPackage: 3.6,
    sector: 'IT Services',
    allowedBranches: ['CSE', 'IT', 'ECE', 'AIML', 'MECH', 'CIVIL'],
    backlogTolerance: 2,
  },
  {
    name: 'Tech Mahindra',
    category: 'safe',
    minCgpa: 6.0,
    avgPackage: 3.25,
    sector: 'IT Services',
    allowedBranches: ['CSE', 'IT', 'ECE', 'AIML', 'MECH', 'CIVIL'],
    backlogTolerance: 2,
  },
  {
    name: 'Cognizant GenC',
    category: 'safe',
    minCgpa: 6.0,
    avgPackage: 4.0,
    sector: 'IT Services',
    allowedBranches: ['CSE', 'IT', 'ECE', 'AIML', 'MECH', 'CIVIL'],
    backlogTolerance: 2,
  },
  {
    name: 'Zensar',
    category: 'safe',
    minCgpa: 6.0,
    avgPackage: 4.0,
    sector: 'IT Services',
    allowedBranches: ['CSE', 'IT', 'ECE', 'AIML'],
    backlogTolerance: 2,
  },
];

async function main() {
  console.log('--- Starting Seed: Placement V2 ---');

  // Clear existing companies to prevent conflicts on reset-seed
  await prisma.company.deleteMany();
  console.log('Cleared existing companies.');

  for (const company of COMPANIES) {
    await prisma.company.create({
      data: {
        name: company.name,
        category: company.category,
        minCgpa: company.minCgpa,
        avgPackage: company.avgPackage,
        sector: company.sector,
        allowedBranches: company.allowedBranches,
        backlogTolerance: company.backlogTolerance,
      },
    });
  }

  console.log(`Seeded ${COMPANIES.length} companies.`);
  console.log('--- Seed Complete ---');
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
