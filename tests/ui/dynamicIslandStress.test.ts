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

async function runStressTests() {
  console.log(`\n${colors.bright}${colors.cyan}GradeFlow Dynamic Island Empirical Stress Tests${colors.reset}`);
  console.log(`----------------------------------------------------------------`);

  // --- Reset Store ---
  useDynamicIslandStore.setState({ activities: [], activeAlert: null, expandedId: null });
  const store = useDynamicIslandStore.getState();

  // ==========================================
  // Edge Case 1: Newer-First Fallback Failure
  // ==========================================
  console.log(`\nTesting Edge Case 1: Stable Sorting / Newer-First Fallback`);
  
  const timer1: LiveActivity = {
    id: "timer-1",
    type: "timer", // Priority 70
    title: "First Timer",
    isActive: true,
    isContextual: true
  };
  
  const timer2: LiveActivity = {
    id: "timer-2",
    type: "timer", // Priority 70
    title: "Second Timer",
    isActive: true,
    isContextual: true
  };

  store.addActivity(timer1);
  store.addActivity(timer2);

  let activities = useDynamicIslandStore.getState().activities;
  // Comment says: "// 3. Fallback: newer is higher priority"
  // Since timer2 was added after timer1, it is "newer" and should sort before timer1.
  assert(
    "Newer activity with same priority should sort first",
    activities[0].id === "timer-2",
    `Expected timer-2 to be first, got: ${JSON.stringify(activities.map(a => a.id))}`
  );

  // Clean up
  useDynamicIslandStore.setState({ activities: [] });

  // ==========================================
  // Edge Case 2: promoteActivity Sorting Invariant Violation
  // ==========================================
  console.log(`\nTesting Edge Case 2: promoteActivity sorting invariant violation`);
  
  const manualTimer: LiveActivity = {
    id: "manual-timer",
    type: "timer", // Priority 70
    title: "Manual Timer",
    isActive: true,
    isContextual: false // Manual
  };
  
  const contextualMusic: LiveActivity = {
    id: "contextual-music",
    type: "music", // Priority 50
    title: "Contextual Music",
    isActive: true,
    isContextual: true
  };

  store.addActivity(manualTimer);
  store.addActivity(contextualMusic);

  // Current activities: [manual-timer, contextual-music]
  // Let's promote contextual-music. It will become manual (isContextual: false).
  // Now we have two manual activities: manual-timer (70) and promoted-music (50).
  // Priority queue rule: manual-timer should be sorted before promoted-music.
  store.promoteActivity("contextual-music");

  activities = useDynamicIslandStore.getState().activities;
  assert(
    "After promoting music (50), manual-timer (70) should still sort before music (50) since both are manual",
    activities[0].id === "manual-timer",
    `Expected manual-timer first, got: ${JSON.stringify(activities.map(a => `${a.id}(isContextual=${a.isContextual},type=${a.type})`))}`
  );

  // Now, what happens if we trigger updateActivity?
  // It will run sortActivities, causing a sudden order change.
  store.updateActivity("manual-timer", { title: "Updated Manual Timer" });
  let activitiesAfterUpdate = useDynamicIslandStore.getState().activities;
  
  assert(
    "Store structure should be consistent before and after updateActivity",
    JSON.stringify(activities.map(a => a.id)) === JSON.stringify(activitiesAfterUpdate.map(a => a.id)),
    `Order changed after update! Before: ${JSON.stringify(activities.map(a => a.id))}, After: ${JSON.stringify(activitiesAfterUpdate.map(a => a.id))}`
  );

  // Clean up
  useDynamicIslandStore.setState({ activities: [], activeAlert: null });

  // ==========================================
  // Edge Case 3: Alert Auto-Dismiss Collision / Race Condition
  // ==========================================
  console.log(`\nTesting Edge Case 3: Alert Auto-Dismiss Collision / Race Condition`);

  const alert1: IslandAlert = {
    id: "alert-same-id",
    type: "info",
    title: "Alert First Instance",
    message: "This is instance 1",
    duration: 100 // ms
  };

  // 1. Show alert first time
  store.showAlert(alert1);
  assert("Alert is active initially", useDynamicIslandStore.getState().activeAlert?.id === "alert-same-id");

  // 2. Dismiss it manually after 50ms
  await new Promise(resolve => setTimeout(resolve, 50));
  store.dismissAlert();
  assert("Alert is dismissed manually", useDynamicIslandStore.getState().activeAlert === null);

  // 3. Show it again with same ID after 10ms (at 60ms elapsed)
  await new Promise(resolve => setTimeout(resolve, 10));
  const alert2: IslandAlert = {
    id: "alert-same-id",
    type: "info",
    title: "Alert Second Instance",
    message: "This is instance 2",
    duration: 100 // ms (supposed to last until 160ms elapsed)
  };
  store.showAlert(alert2);
  assert("Second instance is shown", useDynamicIslandStore.getState().activeAlert?.title === "Alert Second Instance");

  // 4. Wait another 50ms (total 110ms elapsed). This is past the original 100ms timeout from the first instance.
  await new Promise(resolve => setTimeout(resolve, 50));
  
  assert(
    "Second instance of alert should NOT be dismissed by the first instance's timeout",
    useDynamicIslandStore.getState().activeAlert !== null && useDynamicIslandStore.getState().activeAlert?.title === "Alert Second Instance",
    `Expected alert to still be active, but got: ${JSON.stringify(useDynamicIslandStore.getState().activeAlert)}`
  );

  // 5. Wait for the second instance's timeout to fire (total 200ms elapsed)
  await new Promise(resolve => setTimeout(resolve, 100));
  assert("Alert is finally dismissed after its own duration", useDynamicIslandStore.getState().activeAlert === null);

  console.log(`\n----------------------------------------------------------------`);
  console.log(`Stress Tests Completed: ${passedTests}/${totalTests} Passed.`);
}

runStressTests();
