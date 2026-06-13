import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testResumeParse() {
  console.log("Seeding a test user if needed...");
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      provider: 'credentials',
      providerId: 'test-user-id'
    }
  });

  console.log("Sending POST request to localhost:3000/api/parse/resume...");
  const formData = new FormData();
  const blob = new Blob(['dummy pdf content'], { type: 'application/pdf' });
  formData.append('file', blob, 'test.pdf');
  formData.append('jobDescription', 'Looking for a GraphQL engineer with leadership skills.');

  try {
    const response = await fetch('http://localhost:3000/api/parse/resume', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      console.error("Response not OK:", response.status, response.statusText);
      const err = await response.text();
      console.error("Error body:", err);
      process.exit(1);
    }

    const json = await response.json();
    console.log("Successfully got mock JSON:", JSON.stringify(json, null, 2));

    if (!json.skills || !json.atsScore || !json.projects || !json.actionPlan) {
      console.error("Missing required fields in the response JSON!");
      process.exit(1);
    }

    const profile = await prisma.careerProfile.findUnique({
      where: { userId: user.id }
    });

    if (!profile) {
      console.error("CareerProfile was not created in the database for user:", user.id);
      process.exit(1);
    }

    console.log("CareerProfile successfully found in the database:", profile.id);
    console.log("ALL TESTS PASSED.");
    process.exit(0);

  } catch (error) {
    console.error("Fetch error:", error);
    process.exit(1);
  }
}

testResumeParse();
