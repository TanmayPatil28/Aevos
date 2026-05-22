/**
 * Phase 2 Exit Criteria Tests: Strategy Allocator & Comparator
 */

import { strategyAllocator } from "../../lib/strategy/strategyAllocator";
import { demoPersonas } from "../../lib/demo/demo-personas";
import { getPresetById } from "../../lib/presets/presetRegistry";
import { StrategyEngineInput } from "../../lib/strategy/types";

// Helper: build engine input from demo persona
function buildInputFromPersona(personaId: string, targetCgpa?: number): StrategyEngineInput {
  const persona = demoPersonas[personaId];
  if (!persona) throw new Error(`Persona ${personaId} not found`);

  return {
    currentCgpa: persona.academic.currentCgpa,
    earnedCredits: persona.academic.earnedCredits,
    targetCgpa: targetCgpa !== undefined ? targetCgpa : persona.academic.targetCgpa,
    presetId: persona.presetId,
    courses: persona.courses.map(c => ({
      id: c.id,
      code: c.code,
      name: c.name,
      credits: c.credits,
      grade: c.grade,
      cieMarks: c.cieMarks || 0,
      attendanceTotal: c.attendanceTotal || 0,
      attendanceBunked: c.attendanceBunked || 0,
    })),
  };
}

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✅ ${name}`);
  } catch (err: any) {
    failed++;
    console.log(`  ❌ ${name}: ${err.message}`);
    console.error(err);
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message);
}

export function runStrategyTests(): boolean {
  passed = 0;
  failed = 0;
  console.log("\n🎯 strategyAllocator Tests");

test("Arjun (9.2 CGPA, target 9.5) — all 3 strategies return isAchievable: true", () => {
  const input = buildInputFromPersona("arjun");
  input.earnedCredits = 0; // Set to 0 to make target SGPA calculations achievable within a single semester
  input.courses.forEach(c => { c.grade = undefined; }); // Clear grades to allocate

  const safe = strategyAllocator.generate(input, "SAFE");
  const balanced = strategyAllocator.generate(input, "BALANCED");
  const aggressive = strategyAllocator.generate(input, "AGGRESSIVE");

  assert(safe.isAchievable, "SAFE should be achievable");
  assert(balanced.isAchievable, "BALANCED should be achievable");
  assert(aggressive.isAchievable, "AGGRESSIVE should be achievable");
});

test("Rahul (5.5 CGPA, target 6.5) — AGGRESSIVE has low feasibility score", () => {
  const input = buildInputFromPersona("rahul", 6.5);
  input.courses.forEach(c => { c.grade = undefined; }); // Clear grades to allocate

  const aggressive = strategyAllocator.generate(input, "AGGRESSIVE");
  assert(aggressive.feasibilityScore < 50, `AGGRESSIVE should have low feasibility score, got ${aggressive.feasibilityScore}`);
});

test("SAFE strategy target grade points <= AGGRESSIVE target grade points", () => {
  const input = buildInputFromPersona("arjun");
  input.courses.forEach(c => { c.grade = undefined; });

  const safe = strategyAllocator.generate(input, "SAFE");
  const aggressive = strategyAllocator.generate(input, "AGGRESSIVE");

  for (let i = 0; i < input.courses.length; i++) {
    const courseId = input.courses[i].id;
    const safeTarget = safe.courseTargets.find(t => t.courseId === courseId);
    const aggrTarget = aggressive.courseTargets.find(t => t.courseId === courseId);
    if (safeTarget && aggrTarget) {
      assert(
        safeTarget.targetGradePoint <= aggrTarget.targetGradePoint,
        `SAFE target grade point (${safeTarget.targetGradePoint}) should be <= AGGRESSIVE target (${aggrTarget.targetGradePoint}) for course ${courseId}`
      );
    }
  }
});

test("Fixed-grade courses are not modified by any strategy", () => {
  const input = buildInputFromPersona("arjun");
  input.courses[0].grade = "O";
  input.courses[1].grade = "A";
  input.courses[2].grade = undefined;
  input.courses[3].grade = undefined;

  const safe = strategyAllocator.generate(input, "SAFE");
  const balanced = strategyAllocator.generate(input, "BALANCED");
  const aggressive = strategyAllocator.generate(input, "AGGRESSIVE");

  for (const strategy of [safe, balanced, aggressive]) {
    const target0 = strategy.courseTargets.find(t => t.courseId === input.courses[0].id);
    const target1 = strategy.courseTargets.find(t => t.courseId === input.courses[1].id);
    const target2 = strategy.courseTargets.find(t => t.courseId === input.courses[2].id);

    assert(target0?.isFixed === true, "Course 0 should be fixed");
    assert(target0?.targetGrade === "O", `Course 0 target grade should remain O, got ${target0?.targetGrade}`);
    assert(target1?.isFixed === true, "Course 1 should be fixed");
    assert(target1?.targetGrade === "A", `Course 1 target grade should remain A, got ${target1?.targetGrade}`);
    assert(target2?.isFixed === false, "Course 2 should not be fixed");
  }
});

test("All grade targets map to valid grades from the preset grade scale", () => {
  const input = buildInputFromPersona("priya");
  input.courses.forEach(c => { c.grade = undefined; });

  const preset = getPresetById(input.presetId);
  const validGrades = preset?.gradeScale.map(g => g.grade) || [];

  const safe = strategyAllocator.generate(input, "SAFE");
  const balanced = strategyAllocator.generate(input, "BALANCED");
  const aggressive = strategyAllocator.generate(input, "AGGRESSIVE");

  for (const strategy of [safe, balanced, aggressive]) {
    for (const target of strategy.courseTargets) {
      assert(
        validGrades.includes(target.targetGrade),
        `Target grade ${target.targetGrade} should be in preset grade scale: ${validGrades.join(", ")}`
      );
    }
  }
});

  console.log(`\n${"═".repeat(60)}`);
  console.log(`Phase 2 Exit Criteria: ${passed} passed, ${failed} failed`);
  console.log(`${"═".repeat(60)}`);

  return failed === 0;
}
