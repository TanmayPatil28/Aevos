import "dotenv/config";
import { prisma } from "../lib/prisma";

const SPPU_COURSES = [
  { code: "CS-201", name: "Data Structures & Algorithms", credits: 4, prereqs: [] },
  { code: "CS-202", name: "Discrete Mathematics", credits: 4, prereqs: [] },
  { code: "CS-203", name: "Digital Electronics & Logic Design", credits: 3, prereqs: [] },
  { code: "CS-204", name: "Object Oriented Programming", credits: 3, prereqs: [] },
  { code: "CS-205", name: "Computer Graphics", credits: 3, prereqs: [] },
];

const VTU_COURSES = [
  { code: "21CS31", name: "Transform Calculus, Fourier Series And Numerical Techniques", credits: 3, prereqs: [] },
  { code: "21CS32", name: "Data Structures and Applications", credits: 4, prereqs: ["CS-201"] },
  { code: "21CS33", name: "Analog and Digital Electronics", credits: 3, prereqs: [] },
  { code: "21CS34", name: "Computer Organization and Architecture", credits: 3, prereqs: [] },
  { code: "21CS35", name: "Object Oriented Programming with Java", credits: 3, prereqs: [] },
  { code: "21CS36", name: "Audit Course: Constitution of India", credits: 0, prereqs: [] }, // VTU zero credit blocker check!
];

const JNTUH_COURSES = [
  { code: "CS301ES", name: "Analog and Digital Electronics", credits: 3, prereqs: [] },
  { code: "CS302PC", name: "Data Structures", credits: 4, prereqs: [] },
  { code: "CS303PC", name: "Computer Organisation and Architecture", credits: 3, prereqs: [] },
  { code: "CS304PC", name: "Object Oriented Programming through Java", credits: 3, prereqs: [] },
  { code: "CS305MH", name: "Business Economics & Financial Analysis", credits: 3, prereqs: [] },
];

const MU_COURSES = [
  { code: "CSC301", name: "Engineering Mathematics-III", credits: 4, prereqs: [] },
  { code: "CSC302", name: "Discrete Structures and Graph Theory", credits: 3, prereqs: [] },
  { code: "CSC303", name: "Data Structures", credits: 3, prereqs: [] },
  { code: "CSC304", name: "Digital Logic & Computer Architecture", credits: 3, prereqs: [] },
  { code: "CSC305", name: "Computer Graphics", credits: 3, prereqs: [] },
];

async function main() {
  console.log("Starting academic seed sequence...");

  // 1. Clean existing records
  console.log("Cleaning database courses...");
  await prisma.course.deleteMany({});

  // 2. Insert standard university course templates
  const allCourses = [
    ...SPPU_COURSES,
    ...VTU_COURSES,
    ...JNTUH_COURSES,
    ...MU_COURSES,
  ];

  console.log(`Inserting ${allCourses.length} standard university courses...`);

  for (const c of allCourses) {
    const created = await prisma.course.create({
      data: {
        code: c.code,
        name: c.name,
        credits: c.credits,
        prereqs: c.prereqs,
      },
    });
    console.log(`  ✓ Seeded course: [${created.code}] ${created.name} (${created.credits} credits)`);
  }

  console.log("Seed sequence completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seed execution:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
