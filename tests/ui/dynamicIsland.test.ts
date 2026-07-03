import { useDynamicIslandStore, LiveActivity } from "../../stores/dynamicIslandStore";
import * as fs from "fs";
import * as path from "path";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
};

let totalTests = 0;
let passedTests = 0;

function section(name: string) {
  console.log(`\n${colors.bright}${colors.blue}=== SECTION: ${name} ===${colors.reset}`);
}

function assert(description: string, condition: boolean, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${colors.green}✓ PASS:${colors.reset} ${description}`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} ${description}`);
    if (details) {
      console.error(`    ${colors.yellow}Details:${colors.reset} ${details}`);
    }
  }
}

export function runDynamicIslandTests(): boolean {
  totalTests = 0;
  passedTests = 0;

  console.log(`\n${colors.bright}${colors.cyan}GradeFlow Dynamic Island Unit Test Suite${colors.reset}`);
  console.log(`----------------------------------------------------------------`);

  section("1. Priority Queue Sorting");

  // Reset store state
  useDynamicIslandStore.setState({ activities: [], activeAlert: null, expandedId: null });
  const store = useDynamicIslandStore.getState();

  // Add multiple activities of different types
  const musicActivity: LiveActivity = {
    id: "act-music",
    type: "music",
    title: "Favorite Song",
    isActive: true,
    isContextual: true
  };

  const bunkActivity: LiveActivity = {
    id: "act-bunk",
    type: "bunk_calculator",
    title: "Bunk Simulator",
    isActive: true,
    isContextual: true
  };

  const forecastActivity: LiveActivity = {
    id: "act-forecast",
    type: "forecast",
    title: "Grade Forecast",
    isActive: true,
    isContextual: true
  };

  // Add in arbitrary order
  store.addActivity(musicActivity);
  store.addActivity(bunkActivity);
  store.addActivity(forecastActivity);

  let sortedActivities = useDynamicIslandStore.getState().activities;

  assert(
    "Activities are sorted by type priority: bunk_calculator (100) > forecast (85) > music (50)",
    sortedActivities[0].id === "act-bunk" &&
    sortedActivities[1].id === "act-forecast" &&
    sortedActivities[2].id === "act-music",
    `Expected order [act-bunk, act-forecast, act-music], got: ${JSON.stringify(sortedActivities.map(a => a.id))}`
  );

  // Verify that manual activities (isContextual: false) sort before contextual ones
  const manualMusicActivity: LiveActivity = {
    id: "act-music-manual",
    type: "music",
    title: "Manual Music Play",
    isActive: true,
    isContextual: false
  };

  store.addActivity(manualMusicActivity);
  sortedActivities = useDynamicIslandStore.getState().activities;

  assert(
    "Manual activity (isContextual: false) sorts before contextual activity, even if contextual has higher priority type",
    sortedActivities[0].id === "act-music-manual",
    `Expected first activity to be act-music-manual, got: ${sortedActivities[0]?.id}`
  );

  // Clean up
  useDynamicIslandStore.setState({ activities: [] });

  section("2. State Logic Computations");

  // Test helper to compute states based on logic in dynamic-island.tsx
  const computeState = (stateObj: { activities: LiveActivity[]; activeAlert: any; expandedId: string | null }) => {
    const { activities, activeAlert, expandedId } = stateObj;
    const isExpanded = expandedId !== null || activeAlert !== null;
    const isSplit = activities.length > 1 && !isExpanded;
    const isCompact = activities.length === 1 && !isExpanded;
    const isIdle = activities.length === 0 && activeAlert === null && !isExpanded;

    return { isIdle, isCompact, isSplit, isExpanded };
  };

  // Scenario A: Idle
  const stateA = computeState({ activities: [], activeAlert: null, expandedId: null });
  assert("Scenario A (Empty list, no alert, no expansion): isIdle is true", stateA.isIdle === true);
  assert("Scenario A: isCompact is false", stateA.isCompact === false);
  assert("Scenario A: isSplit is false", stateA.isSplit === false);
  assert("Scenario A: isExpanded is false", stateA.isExpanded === false);

  // Scenario B: Compact
  const stateB = computeState({ activities: [musicActivity], activeAlert: null, expandedId: null });
  assert("Scenario B (1 activity, no alert, no expansion): isIdle is false", stateB.isIdle === false);
  assert("Scenario B: isCompact is true", stateB.isCompact === true);
  assert("Scenario B: isSplit is false", stateB.isSplit === false);
  assert("Scenario B: isExpanded is false", stateB.isExpanded === false);

  // Scenario C: Split
  const stateC = computeState({ activities: [musicActivity, bunkActivity], activeAlert: null, expandedId: null });
  assert("Scenario C (2 activities, no alert, no expansion): isIdle is false", stateC.isIdle === false);
  assert("Scenario C: isCompact is false", stateC.isCompact === false);
  assert("Scenario C: isSplit is true", stateC.isSplit === true);
  assert("Scenario C: isExpanded is false", stateC.isExpanded === false);

  // Scenario D: Expanded by alert
  const stateD = computeState({ activities: [musicActivity], activeAlert: { id: "alert1" }, expandedId: null });
  assert("Scenario D (Alert present): isExpanded is true", stateD.isExpanded === true);
  assert("Scenario D: isCompact is false", stateD.isCompact === false);
  assert("Scenario D: isSplit is false", stateD.isSplit === false);
  assert("Scenario D: isIdle is false", stateD.isIdle === false);

  // Scenario E: Expanded by user click
  const stateE = computeState({ activities: [musicActivity], activeAlert: null, expandedId: "act-music" });
  assert("Scenario E (Expanded activity set): isExpanded is true", stateE.isExpanded === true);
  assert("Scenario E: isCompact is false", stateE.isCompact === false);
  assert("Scenario E: isSplit is false", stateE.isSplit === false);
  assert("Scenario E: isIdle is false", stateE.isIdle === false);

  section("3. Spring Constants Verification");

  const filesToVerify = [
    "components/dynamic-island/LiveActivities.tsx",
    "components/placement/DynamicIsland.tsx",
    "components/attendance/DynamicIsland.tsx"
  ];

  let allFilesConform = true;

  for (const relPath of filesToVerify) {
    const fullPath = path.join(__dirname, "../../", relPath);
    try {
      const content = fs.readFileSync(fullPath, "utf8");
      
      // Look for transitions containing stiffness
      const stiffnessMatches = content.match(/stiffness\s*:\s*(\d+)/g) || [];
      const dampingMatches = content.match(/damping\s*:\s*(\d+)/g) || [];
      
      // Old values search (400, 450, 500)
      const hasOldStiffness = stiffnessMatches.some(match => {
        const val = match.match(/\d+/)?.[0];
        return val === "400" || val === "450" || val === "500";
      });

      const hasOldDamping = dampingMatches.some(match => {
        const val = match.match(/\d+/)?.[0];
        return val === "17" || val === "30" || val === "35" || val === "40";
      });

      // Verify that standard Apple settings are indeed used in the file
      const hasStiffness350 = content.includes("stiffness: 350");
      const hasDamping28 = content.includes("damping: 28");

      assert(
        `File ${relPath} conforms: does NOT contain old spring values (stiffness 400/450/500, damping 17/30/35/40)`,
        !hasOldStiffness && !hasOldDamping,
        `Found suspicious spring config in ${relPath}. Matches: stiffness: ${JSON.stringify(stiffnessMatches)}, damping: ${JSON.stringify(dampingMatches)}`
      );

      assert(
        `File ${relPath} utilizes standard stiffness 350 and damping 28`,
        hasStiffness350 && hasDamping28,
        `Missing 'stiffness: 350' or 'damping: 28' config in ${relPath}`
      );

      if (hasOldStiffness || hasOldDamping || !hasStiffness350 || !hasDamping28) {
        allFilesConform = false;
      }
    } catch (err: any) {
      assert(`Successfully read and processed file ${relPath}`, false, err.message);
      allFilesConform = false;
    }
  }

  assert("All files conform programmatically to Apple spring physics alignment", allFilesConform);

  console.log(`----------------------------------------------------------------`);
  console.log(`Dynamic Island Tests Results: ${passedTests}/${totalTests} Passed.`);
  return passedTests === totalTests;
}
