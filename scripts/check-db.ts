import 'dotenv/config';
import { prisma } from '../lib/prisma';
async function main() {
  const users = await prisma.user.findMany();
  console.log("Users:", users.map(u => u.id));
  if (users.length > 0) {
    const enrollments = await prisma.enrollment.findMany({ where: { userId: users[0].id }, include: { course: { include: { timetableSlots: true } } } });
    console.log("Enrollments:", enrollments.map(e => ({ courseId: e.courseId, sem: e.semester, courseName: e.course.name, slots: e.course.timetableSlots.length })));
  }
}
main();
