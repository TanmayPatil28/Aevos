import { useDynamicIslandStore, LiveActivity, IslandAlert } from "../../stores/dynamicIslandStore";

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

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function runStressTests() {
  console.log(`\n${colors.bright}${colors.cyan}GradeFlow Dynamic Island Stress Test Suite${colors.reset}`);
  console.log(`----------------------------------------------------------------`);

  // --- STRESS CASE 1: promoteActivity bypasses sort/priority logic ---
  console.log(`\n${colors.bright}${colors.blue}STRESS CASE 1: Out-of-order Activation via promoteActivity${colors.reset}`);
  
  // Reset store
  useDynamicIslandStore.setState({ activities: [], activeAlert: null, expandedId: null });
  const store = useDynamicIslandStore.getState();

  const activityA: LiveActivity = {
    id: "act-a",
    type: "bunk_calculator", // priority 100
    title: "Bunk Calc (Manual)",
    isActive: true,
    isContextual: false // manual user activity
  };

  const activityB: LiveActivity = {
    id: "act-b",
    type: "timer", // priority 70
    title: "Timer (Contextual)",
    isActive: true,
    isContextual: true // automatic contextual
  };

  // Add activities
  store.addActivity(activityA);
  store.addActivity(activityB);

  // Check initial sorted state
  let currentActivities = useDynamicIslandStore.getState().activities;
  assert(
    "Initially sorted: Bunk Calc (100, manual) before Timer (70, contextual)",
    currentActivities[0].id === "act-a" && currentActivities[1].id === "act-b",
    `Order: ${JSON.stringify(currentActivities.map(a => a.id))}`
  );

  // Promote B (becomes manual, isContextual: false)
  store.promoteActivity("act-b");
  currentActivities = useDynamicIslandStore.getState().activities;

  // Let's see if the order is priority-correct now. Both are manual. A is priority 100, B is priority 70.
  // The correct order should be [act-a, act-b].
  // But promoteActivity puts target at index 0 without sorting, so it will be [act-b, act-a].
  const isSortedAfterPromotion = currentActivities[0].id === "act-a" && currentActivities[1].id === "act-b";
  assert(
    "Activity list is correctly sorted after promoting activity (Bunk Calc precedes promoted Timer)",
    isSortedAfterPromotion,
    `Order after promotion: ${JSON.stringify(currentActivities.map(a => a.id))} (Timer was put first despite lower type priority)`
  );

  // Trigger an update to see if it suddenly re-sorts
  store.updateActivity("act-a", { title: "Bunk Calc Updated" });
  currentActivities = useDynamicIslandStore.getState().activities;
  assert(
    "Activity list re-sorts on unrelated update, changing display order",
    currentActivities[0].id === "act-a" && currentActivities[1].id === "act-b",
    `Order after update: ${JSON.stringify(currentActivities.map(a => a.id))}`
  );


  // --- STRESS CASE 2: Fallback Sorting "newer is higher priority" logic ---
  console.log(`\n${colors.bright}${colors.blue}STRESS CASE 2: Fallback Sorting / Recency Priority${colors.reset}`);
  
  // Reset store
  useDynamicIslandStore.setState({ activities: [], activeAlert: null, expandedId: null });

  const timerC: LiveActivity = {
    id: "act-c",
    type: "timer", // priority 70
    title: "Timer C (Older)",
    isActive: true,
    isContextual: true
  };

  const timerD: LiveActivity = {
    id: "act-d",
    type: "timer", // priority 70
    title: "Timer D (Newer)",
    isActive: true,
    isContextual: true
  };

  // Add C then D
  store.addActivity(timerC);
  store.addActivity(timerD);

  currentActivities = useDynamicIslandStore.getState().activities;
  // According to comment: newer is higher priority, so D should precede C.
  const isNewerFirst = currentActivities[0].id === "act-d";
  assert(
    "Fallback sorting: newer activity (Timer D) is sorted before older activity (Timer C) of the same priority type",
    isNewerFirst,
    `Order: ${JSON.stringify(currentActivities.map(a => a.id))} (Timer C is first)`
  );


  // --- STRESS CASE 3: Strict Weak Ordering Violation (isContextual comparison asymmetry) ---
  console.log(`\n${colors.bright}${colors.blue}STRESS CASE 3: Asymmetric Contextual Sorting Asymmetry (Strict Weak Ordering)${colors.reset}`);

  // Let's extract the sort logic and run it on activities E and F directly.
  const ACTIVITY_PRIORITY: Record<string, number> = {
    bunk_calculator: 100,
    exam_countdown: 90,
    forecast: 85,
    schedule: 80,
    timer: 70,
    progress: 60,
    music: 50,
    academic_status: 40,
    time_context: 30,
  };

  const compareActivities = (a: Partial<LiveActivity>, b: Partial<LiveActivity>): number => {
    // 1. Manual user activities override automatic contextual ones
    const isContA = !!a.isContextual;
    const isContB = !!b.isContextual;
    if (isContA !== isContB) {
      return isContA ? 1 : -1;
    }
    // 2. Sort by type priority
    const priorityA = ACTIVITY_PRIORITY[a.type || ""] || 0;
    const priorityB = ACTIVITY_PRIORITY[b.type || ""] || 0;
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }
    // 3. Fallback: newer is higher priority
    return 0;
  };

  const activityE = { id: "act-e", type: "timer", isContextual: undefined };
  const activityF = { id: "act-f", type: "timer", isContextual: false };

  const compEF = compareActivities(activityE, activityF);
  const compFE = compareActivities(activityF, activityE);

  assert(
    "Strict weak ordering asymmetry check: compare(E, F) should be opposite of compare(F, E)",
    compEF === -compFE && !(compEF === -1 && compFE === -1),
    `compare(E, F) returned ${compEF}, compare(F, E) returned ${compFE}`
  );


  // --- STRESS CASE 4: Alert Race Conditions & Premature Dismissal ---
  console.log(`\n${colors.bright}${colors.blue}STRESS CASE 4: Alert Race Conditions & Premature Dismissal${colors.reset}`);
  
  // Reset store
  useDynamicIslandStore.setState({ activities: [], activeAlert: null, expandedId: null });

  const alertA: IslandAlert = {
    id: "alert-a",
    type: "success",
    title: "Alert A",
    message: "First Alert",
    duration: 100 // Short duration for fast testing
  };

  const alertB: IslandAlert = {
    id: "alert-b",
    type: "warning",
    title: "Alert B",
    message: "Intermediary Alert",
    duration: 100
  };

  // 1. Show Alert A (will set timeout to dismiss in 100ms)
  store.showAlert(alertA);
  await sleep(30); // wait 30ms

  // 2. Show Alert B (overwrites A, sets timeout to dismiss in 100ms)
  store.showAlert(alertB);
  await sleep(30); // wait 30ms (total 60ms since Alert A)

  // 3. Show Alert A again (overwrites B, sets timeout to dismiss in 100ms)
  store.showAlert(alertA);

  // Check alert is currently Alert A
  assert("Current active alert is Alert A", useDynamicIslandStore.getState().activeAlert?.id === "alert-a");

  // Wait for 50ms more (total 110ms since first Alert A, so first timeout will fire)
  await sleep(50);

  // Let's see if the first Alert A's timeout has dismissed the new Alert A instance!
  const activeAlertAfterFirstTimeout = useDynamicIslandStore.getState().activeAlert;
  assert(
    "Alert A survives the first timeout because it was re-instantiated",
    activeAlertAfterFirstTimeout !== null,
    `Alert was dismissed prematurely to null! Active: ${JSON.stringify(activeAlertAfterFirstTimeout)}`
  );

  // Clean up
  useDynamicIslandStore.setState({ activities: [], activeAlert: null, expandedId: null });

  console.log(`----------------------------------------------------------------`);
  console.log(`Stress Test Results: ${passedTests}/${totalTests} Passed.`);
  process.exit(passedTests === totalTests ? 0 : 1);
}

// If run directly
if (require.main === module) {
  runStressTests();
}
