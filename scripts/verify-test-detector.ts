import * as fs from 'fs';

// This script verifies that the check logic from scripts/test-benchmark-audit.ts
// correctly detects when a mandatory field is missing or marked as optional.

function runCheck(schemaContent: string) {
  const modelRegex = /model\s+UserPhysicsProfile\s*{([^}]*)}/;
  const match = schemaContent.match(modelRegex);
  if (!match) {
    throw new Error('Model UserPhysicsProfile not found in schema.prisma');
  }
  const modelBody = match[1];

  const fieldsToCheck = ['circadianRhythm', 'sleepDebt', 'baselineFatigue'];
  for (const field of fieldsToCheck) {
    const regex = new RegExp(`\\b${field}\\b`);
    if (!regex.test(modelBody)) {
      throw new Error(`Field ${field} is missing in UserPhysicsProfile model`);
    }

    const fieldTypeMatch = modelBody.match(new RegExp(`\\b${field}\\s+(\\w+)\\??`));
    if (!fieldTypeMatch) {
      throw new Error(`Could not parse ${field} field type`);
    }
    if (fieldTypeMatch[0].includes('?')) {
      throw new Error(`${field} must be a mandatory field (found optional '?')`);
    }
  }
}

const mockValidSchema = `
model UserPhysicsProfile {
  id                String   @id @default(cuid())
  userId            String   @unique @map("user_id")
  circadianRhythm   String   @default("neutral")
  baselineFatigue   Float    @default(0.0)
  sleepDebt         Float    @default(0.0)
  updatedAt         DateTime @default(now()) @updatedAt @map("updated_at")
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_physics_profiles")
}
`;

const mockCompleteMissingSchema = `
model UserPhysicsProfile {
  id                String   @id @default(cuid())
  userId            String   @unique @map("user_id")
  circadianRhythm   String   @default("neutral")
  baselineFatigue   Float    @default(0.0)
  updatedAt         DateTime @default(now()) @updatedAt @map("updated_at")
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_physics_profiles")
}
`;

const mockCommentedMissingSchema = `
model UserPhysicsProfile {
  id                String   @id @default(cuid())
  userId            String   @unique @map("user_id")
  circadianRhythm   String   @default("neutral")
  baselineFatigue   Float    @default(0.0)
  // sleepDebt         Float    @default(0.0)
  updatedAt         DateTime @default(now()) @updatedAt @map("updated_at")
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_physics_profiles")
}
`;

const mockOptionalFieldSchema = `
model UserPhysicsProfile {
  id                String   @id @default(cuid())
  userId            String   @unique @map("user_id")
  circadianRhythm   String?  @default("neutral") // Optional!
  baselineFatigue   Float    @default(0.0)
  sleepDebt         Float    @default(0.0)
  updatedAt         DateTime @default(now()) @updatedAt @map("updated_at")
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_physics_profiles")
}
`;

console.log("Testing Mock Valid Schema...");
try {
  runCheck(mockValidSchema);
  console.log("PASS: Valid schema passed check successfully.");
} catch (e: any) {
  console.log("FAIL: Valid schema failed check:", e.message);
}

console.log("\nTesting Mock Complete Missing Schema...");
try {
  runCheck(mockCompleteMissingSchema);
  console.log("FAIL: Complete missing schema was not detected!");
} catch (e: any) {
  console.log("PASS: Correctly detected completely missing field:", e.message);
}

console.log("\nTesting Mock Commented-out Missing Schema...");
try {
  runCheck(mockCommentedMissingSchema);
  console.log("FAIL: Commented-out field was NOT detected as missing! (Vulnerability in regex)");
} catch (e: any) {
  console.log("PASS: Correctly detected commented-out field:", e.message);
}

console.log("\nTesting Mock Optional Field Schema...");
try {
  runCheck(mockOptionalFieldSchema);
  console.log("FAIL: Optional field schema was not detected!");
} catch (e: any) {
  console.log("PASS: Correctly detected optional field:", e.message);
}

