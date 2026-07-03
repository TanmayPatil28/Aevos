import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const dayMap: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
};

export async function GET(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch Enrollments for the user to get their courses and timetable slots
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            timetableSlots: true
          }
        }
      }
    });

    // Filter to only the most recent semester
    let maxSem = 0;
    enrollments.forEach(en => {
      const semNum = parseInt(String(en.semester).replace(/\D/g, ''), 10);
      if (!isNaN(semNum) && semNum > maxSem) {
        maxSem = semNum;
      }
    });

    const activeEnrollments = enrollments.filter(en => {
      const semNum = parseInt(String(en.semester).replace(/\D/g, ''), 10);
      return semNum === maxSem;
    });

    const courses: any[] = [];
    const timetable: Record<string, any[]> = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: []
    };

    activeEnrollments.forEach((en, index) => {
      const c = en.course;
      courses.push({
        id: c.id,
        code: c.code,
        name: c.name,
        semester: en.semester,
        credits: c.credits,
        cieMarks: en.cieMarks,
        attendanceTotal: en.attendanceTotal,
        attendanceBunked: en.attendanceBunked,
      });

      if (c.timetableSlots && c.timetableSlots.length > 0) {
        c.timetableSlots.forEach(slot => {
          const dayStr = dayMap[slot.dayOfWeek];
          if (dayStr) {
            timetable[dayStr].push({
              id: slot.id,
              courseId: c.id,
              type: 'LECTURE', // Defaulting to lecture as there is no type in schema
              startTime: slot.startTime,
              endTime: slot.endTime,
              room: slot.room
            });
          }
        });
      } else {
        // Fallback mock schedule generation for prototyping
        // Distribute classes across Mon-Fri based on index
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        const day1 = days[index % 5];
        const day2 = days[(index + 2) % 5];
        
        const startHour = 9 + (index % 6);
        const startTimeStr = `${startHour.toString().padStart(2, '0')}:00`;
        const endTimeStr = `${(startHour + 1).toString().padStart(2, '0')}:00`;
        
        timetable[day1].push({
          id: `mock-${c.id}-1`,
          courseId: c.id,
          type: 'LECTURE',
          startTime: startTimeStr,
          endTime: endTimeStr,
          room: 'TBD'
        });
        
        timetable[day2].push({
          id: `mock-${c.id}-2`,
          courseId: c.id,
          type: 'LECTURE',
          startTime: startTimeStr,
          endTime: endTimeStr,
          room: 'TBD'
        });
      }
    });

    return NextResponse.json({ courses, timetable });
  } catch (error) {
    console.error("[Timetable GET Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
