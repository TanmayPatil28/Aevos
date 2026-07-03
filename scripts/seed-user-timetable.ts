import 'dotenv/config';
import { prisma } from '../lib/prisma';

const dayMap: Record<string, number> = {
  sunday: 0,
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6
};

const data = {
  "monday": [
    {
      "courseId": "43ea7a09-8d0a-4bc9-afd3-0d5244e0944e",
      "type": "PRACTICAL",
      "startTime": "08:15",
      "endTime": "10:15",
      "room": "MAC",
      "batch": "H2",
      "faculty": "Dr. Waseem Mir"
    },
    {
      "courseId": "05b1c352-68ec-4580-acdb-d885a885e0bb",
      "type": "PRACTICAL",
      "startTime": "08:15",
      "endTime": "10:15",
      "room": "MAC",
      "batch": "H3",
      "faculty": "Dr. Roman Biddhique"
    },
    {
      "courseId": "9ea763eb-447c-43da-a301-b301d21be3ea",
      "type": "LECTURE",
      "startTime": "10:30",
      "endTime": "11:30",
      "room": "B-218",
      "batch": "ALL",
      "faculty": "Miss. Jasmin Jamen"
    },
    {
      "courseId": "4c1c51c4-f1e1-4d2b-89e5-f42d94ac5109",
      "type": "LECTURE",
      "startTime": "11:30",
      "endTime": "12:30",
      "room": "B-218",
      "batch": "ALL",
      "faculty": "Dr. Waseem Mir"
    },
    {
      "courseId": "05b1c352-68ec-4580-acdb-d885a885e0bb",
      "type": "LECTURE",
      "startTime": "13:15",
      "endTime": "14:15",
      "room": "B-218",
      "batch": "ALL",
      "faculty": "Dr. Roman Biddhique"
    },
    {
      "courseId": "3270f47e-35b3-4476-90a2-e00455870d67",
      "type": "LECTURE",
      "startTime": "14:15",
      "endTime": "15:15",
      "room": "B-218",
      "batch": "ALL",
      "faculty": "Dr. Prashant Metri"
    },
    {
      "courseId": "3270f47e-35b3-4476-90a2-e00455870d67",
      "type": "TUTORIAL",
      "startTime": "15:30",
      "endTime": "17:30",
      "room": "SSP-A420",
      "batch": "H1",
      "faculty": "Dr. Prashant Metri"
    }
  ],
  "tuesday": [
    {
      "courseId": "43ea7a09-8d0a-4bc9-afd3-0d5244e0944e",
      "type": "PRACTICAL",
      "startTime": "08:15",
      "endTime": "10:15",
      "room": "MAC",
      "batch": "H3",
      "faculty": "Dr. Waseem Mir"
    },
    {
      "courseId": "94285a0c-5161-4c32-9b39-a7e9428a23d4",
      "type": "PRACTICAL",
      "startTime": "08:15",
      "endTime": "10:15",
      "room": "MAC",
      "batch": "H1",
      "faculty": "Mrs. Ravina Malchikara"
    },
    {
      "courseId": "6ed98447-bf3e-4478-87eb-3d3d4995408c",
      "type": "LECTURE",
      "startTime": "10:30",
      "endTime": "11:30",
      "room": "B-218",
      "batch": "ALL",
      "faculty": "Mrs. Ravina Malchikara"
    },
    {
      "courseId": "4c1c51c4-f1e1-4d2b-89e5-f42d94ac5109",
      "type": "LECTURE",
      "startTime": "11:30",
      "endTime": "12:30",
      "room": "B-218",
      "batch": "ALL",
      "faculty": "Dr. Waseem Mir"
    },
    {
      "courseId": "3270f47e-35b3-4476-90a2-e00455870d67",
      "type": "TUTORIAL",
      "startTime": "15:30",
      "endTime": "17:30",
      "room": "SSP-A420",
      "batch": "H2",
      "faculty": "Dr. Prashant Metri"
    }
  ],
  "wednesday": [
    {
      "courseId": "3270f47e-35b3-4476-90a2-e00455870d67",
      "type": "TUTORIAL",
      "startTime": "08:15",
      "endTime": "10:15",
      "room": "C-304",
      "batch": "H3",
      "faculty": "Dr. Prashant Metri"
    },
    {
      "courseId": "43ea7a09-8d0a-4bc9-afd3-0d5244e0944e",
      "type": "PRACTICAL",
      "startTime": "08:15",
      "endTime": "10:15",
      "room": "MAC",
      "batch": "H1",
      "faculty": "Dr. Waseem Mir"
    },
    {
      "courseId": "94285a0c-5161-4c32-9b39-a7e9428a23d4",
      "type": "PRACTICAL",
      "startTime": "08:15",
      "endTime": "10:15",
      "room": "MAC",
      "batch": "H2",
      "faculty": "Mrs. Ravina Malchikara"
    },
    {
      "courseId": "4c1c51c4-f1e1-4d2b-89e5-f42d94ac5109",
      "type": "LECTURE",
      "startTime": "10:30",
      "endTime": "11:30",
      "room": "B-218",
      "batch": "ALL",
      "faculty": "Dr. Waseem Mir"
    },
    {
      "courseId": "9ea763eb-447c-43da-a301-b301d21be3ea",
      "type": "LECTURE",
      "startTime": "11:30",
      "endTime": "12:30",
      "room": "B-218",
      "batch": "ALL",
      "faculty": "Miss. Jasmin Jamen"
    },
    {
      "courseId": "05b1c352-68ec-4580-acdb-d885a885e0bb",
      "type": "PRACTICAL",
      "startTime": "13:15",
      "endTime": "15:15",
      "room": "B81",
      "batch": "H2",
      "faculty": "Dr. Roman Biddhique"
    },
    {
      "courseId": "c4ec064f-9492-4e34-98de-2e77fa35fdb0",
      "type": "PRACTICAL",
      "startTime": "13:15",
      "endTime": "15:15",
      "room": "A-203",
      "batch": "H3",
      "faculty": "Mr. Dhananjay Warthe"
    },
    {
      "courseId": "9ea763eb-447c-43da-a301-b301d21be3ea",
      "type": "PRACTICAL",
      "startTime": "13:15",
      "endTime": "15:15",
      "room": "A-210",
      "batch": "H1",
      "faculty": "Miss. Jasmin Jamen"
    }
  ],
  "thursday": [
    {
      "courseId": "05b1c352-68ec-4580-acdb-d885a885e0bb",
      "type": "PRACTICAL",
      "startTime": "08:15",
      "endTime": "10:15",
      "room": "B81",
      "batch": "H1",
      "faculty": "Dr. Roman Biddhique"
    },
    {
      "courseId": "c4ec064f-9492-4e34-98de-2e77fa35fdb0",
      "type": "PRACTICAL",
      "startTime": "08:15",
      "endTime": "10:15",
      "room": "MAC",
      "batch": "H2",
      "faculty": "Mr. Dhananjay Warthe"
    },
    {
      "courseId": "9ea763eb-447c-43da-a301-b301d21be3ea",
      "type": "PRACTICAL",
      "startTime": "08:15",
      "endTime": "10:15",
      "room": "MAC",
      "batch": "H3",
      "faculty": "Miss. Jasmin Jamen"
    },
    {
      "courseId": "3270f47e-35b3-4476-90a2-e00455870d67",
      "type": "LECTURE",
      "startTime": "10:30",
      "endTime": "11:30",
      "room": "B-218",
      "batch": "ALL",
      "faculty": "Dr. Prashant Metri"
    },
    {
      "courseId": "6ed98447-bf3e-4478-87eb-3d3d4995408c",
      "type": "LECTURE",
      "startTime": "11:30",
      "endTime": "12:30",
      "room": "B-218",
      "batch": "ALL",
      "faculty": "Mrs. Ravina Malchikara"
    },
    {
      "courseId": "c4ec064f-9492-4e34-98de-2e77fa35fdb0",
      "type": "LECTURE",
      "startTime": "13:15",
      "endTime": "14:15",
      "room": "B-218",
      "batch": "ALL",
      "faculty": "Mr. Dhananjay Warthe"
    },
    {
      "courseId": "af8ed72d-b1ea-4bec-b6f5-63693edb4ce7",
      "type": "LECTURE",
      "startTime": "14:15",
      "endTime": "15:15",
      "room": "B-218",
      "batch": "ALL",
      "faculty": "Ms. Pallavi Shewale"
    }
  ],
  "friday": [
    {
      "courseId": "94285a0c-5161-4c32-9b39-a7e9428a23d4",
      "type": "PRACTICAL",
      "startTime": "08:15",
      "endTime": "10:15",
      "room": "B81",
      "batch": "H3",
      "faculty": "Mrs. Ravina Malchikara"
    },
    {
      "courseId": "c4ec064f-9492-4e34-98de-2e77fa35fdb0",
      "type": "PRACTICAL",
      "startTime": "08:15",
      "endTime": "10:15",
      "room": "MAC",
      "batch": "H1",
      "faculty": "Mr. Dhananjay Warthe"
    },
    {
      "courseId": "9ea763eb-447c-43da-a301-b301d21be3ea",
      "type": "PRACTICAL",
      "startTime": "08:15",
      "endTime": "10:15",
      "room": "MAC",
      "batch": "H2",
      "faculty": "Miss. Jasmin Jamen"
    },
    {
      "courseId": "3270f47e-35b3-4476-90a2-e00455870d67",
      "type": "LECTURE",
      "startTime": "10:30",
      "endTime": "11:30",
      "room": "B-218",
      "batch": "ALL",
      "faculty": "Dr. Prashant Metri"
    },
    {
      "courseId": "6ed98447-bf3e-4478-87eb-3d3d4995408c",
      "type": "LECTURE",
      "startTime": "11:30",
      "endTime": "12:30",
      "room": "B-218",
      "batch": "ALL",
      "faculty": "Mrs. Ravina Malchikara"
    },
    {
      "courseId": "af8ed72d-b1ea-4bec-b6f5-63693edb4ce7",
      "type": "LECTURE",
      "startTime": "13:15",
      "endTime": "14:15",
      "room": "B-218",
      "batch": "ALL",
      "faculty": "Ms. Pallavi Shewale"
    }
  ],
  "saturday": []
};

async function main() {
  console.log('Seeding timetable slots...');
  
  const courseIds = new Set<string>();
  Object.values(data).forEach(daySlots => {
    daySlots.forEach(slot => courseIds.add(slot.courseId));
  });

  // Ensure all courses exist, create dummy if not
  for (const cid of Array.from(courseIds)) {
    const existing = await prisma.course.findUnique({ where: { id: cid } });
    if (!existing) {
      console.log(`Course ${cid} missing. Creating dummy course...`);
      await prisma.course.create({
        data: {
          id: cid,
          code: `DUMMY-${cid.substring(0,4)}`,
          name: 'Restored Course',
          credits: 3
        }
      });
      
      // Assume user enrollment is needed too
      const firstUser = await prisma.user.findFirst();
      if (firstUser) {
        await prisma.enrollment.create({
          data: {
            userId: firstUser.id,
            courseId: cid,
            semester: "4"
          }
        });
      }
    }
  }

  await prisma.timetableSlot.deleteMany({
    where: { courseId: { in: Array.from(courseIds) } }
  });

  let count = 0;
  for (const [day, slots] of Object.entries(data)) {
    const dayOfWeek = dayMap[day.toLowerCase()];
    if (dayOfWeek === undefined) continue;

    for (const slot of slots) {
      await prisma.timetableSlot.create({
        data: {
          courseId: slot.courseId,
          dayOfWeek: dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          room: slot.room,
          instructor: slot.faculty,
          section: slot.batch,
          semester: "4",
          academicYear: "2024-2025"
        }
      });
      count++;
    }
  }

  console.log(`Successfully seeded ${count} timetable slots!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
