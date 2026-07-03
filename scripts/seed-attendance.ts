import { prisma } from '../lib/prisma';

async function main() {
  console.log('Seeding database with test user and attendance logs...');

  // 1. Find the user (must log in first to create via Supabase)
  const user = await prisma.user.findFirst({
    where: { email: { not: null } }
  });

  if (!user) {
    console.error('No user found in Prisma! Please log in via the UI first so Supabase creates the user.');
    process.exit(1);
  }

  console.log(`Seeding data for user: ${user.email} (${user.id})`);

  // Update onboarded status
  await prisma.user.update({
    where: { id: user.id },
    data: { isOnboarded: true, university: 'MIT' }
  });

  // 2. Create courses
  const coursesData = [
    { code: 'CS101', name: 'Intro to Cryptography', credits: 4 },
    { code: 'CS201', name: 'Computer Algorithms', credits: 4 },
    { code: 'MTH304', name: 'Vector Calculus', credits: 3 },
    { code: 'CS405', name: 'Embedded Systems', credits: 3 },
    { code: 'ENG101', name: 'Communicative Skills', credits: 2 },
  ];

  const createdCourses = [];
  for (const c of coursesData) {
    const course = await prisma.course.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
    createdCourses.push(course);
  }

  console.log(`Created ${createdCourses.length} courses.`);

  // 3. Create enrollments and historical attendance
  // Let's assume a semester started 30 days ago.
  const semesterStart = new Date();
  semesterStart.setDate(semesterStart.getDate() - 30);

  for (const course of createdCourses) {
    // Generate some random attendance logic
    // Conducted between 15 and 25 classes so far
    const classesConducted = Math.floor(Math.random() * 10) + 15;
    let classesAttended = 0;
    
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        courseId: course.id,
        semester: 'Fall 2026',
        attendanceTotal: 40 // Target total classes for the sem
      }
    });

    // Create logs
    for (let i = 0; i < classesConducted; i++) {
      const isPresent = Math.random() > 0.15; // 85% attendance probability
      if (isPresent) classesAttended++;
      
      const logDate = new Date(semesterStart);
      logDate.setDate(logDate.getDate() + i);

      await prisma.attendanceLog.create({
        data: {
          enrollmentId: enrollment.id,
          date: logDate,
          status: isPresent ? 'PRESENT' : 'ABSENT',
        }
      });
    }
    
    // Update enrollment summary
    await prisma.enrollment.update({
      where: { id: enrollment.id },
      data: {
        attendanceBunked: classesConducted - classesAttended
      }
    });
    
    console.log(`Enrollment ${course.code}: ${classesAttended}/${classesConducted} attended`);
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
