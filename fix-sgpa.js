const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  console.log("Looking for snapshots with SGPA 0 in Semester 1...");
  
  const snapshots = await prisma.academicSnapshot.findMany();
  let updatedCount = 0;

  for (const snap of snapshots) {
    if (!snap.academicProfile) continue;
    
    let profile = snap.academicProfile;
    if (typeof profile === 'string') {
      profile = JSON.parse(profile);
    }

    if (profile.semesterHistory && Array.isArray(profile.semesterHistory)) {
      let changed = false;
      profile.semesterHistory = profile.semesterHistory.map((sem) => {
        if (sem.semester === 1 && sem.sgpa === 0) {
          console.log(`Fixing SGPA for Snapshot ID: ${snap.id}`);
          changed = true;
          return { ...sem, sgpa: 7.48 };
        }
        return sem;
      });

      if (changed) {
        await prisma.academicSnapshot.update({
          where: { id: snap.id },
          data: { academicProfile: profile }
        });
        updatedCount++;
      }
    }
  }

  console.log(`Successfully fixed ${updatedCount} snapshots!`);
}

fix().catch(console.error).finally(() => prisma.$disconnect());
