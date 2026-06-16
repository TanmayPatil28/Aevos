import { rateLimit } from "../../lib/rateLimit";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m"
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

export function runRateLimitTests(): boolean {
  console.log(`\n${colors.bright}${colors.blue}GradeFlow Rate Limiter Unit Test Suite${colors.reset}`);
  console.log(`----------------------------------------------------------------`);

  section("Basic Rate Limiting (Single IP)");

  const ip1 = "192.168.1.1";
  
  // Call 1-3
  let res1 = rateLimit(ip1, 3, 10000);
  assert("First request is allowed", res1.success);
  assert("First request returns correct remaining count", res1.remaining === 2);

  let res2 = rateLimit(ip1, 3, 10000);
  assert("Second request is allowed", res2.success);
  assert("Second request returns correct remaining count", res2.remaining === 1);

  let res3 = rateLimit(ip1, 3, 10000);
  assert("Third request is allowed", res3.success);
  assert("Third request returns correct remaining count", res3.remaining === 0);

  // Fourth call should be blocked
  let res4 = rateLimit(ip1, 3, 10000);
  assert("Fourth request is rate limited", !res4.success);
  assert("Fourth request returns 0 remaining", res4.remaining === 0);

  section("IP Isolation (Different IP)");

  const ip2 = "192.168.1.2";
  let resIp2 = rateLimit(ip2, 3, 10000);
  assert("Request from a different IP is allowed", resIp2.success);
  assert("Different IP has independent remaining count", resIp2.remaining === 2);

  section("Time Window Expiration");

  // We can simulate time expiration by using a very short window (e.g. 10ms)
  const ip3 = "192.168.1.3";
  let resShort1 = rateLimit(ip3, 1, 5); // 5ms window
  assert("First request with short window is allowed", resShort1.success);

  let resShort2 = rateLimit(ip3, 1, 5);
  assert("Immediate second request is rate limited", !resShort2.success);

  // Busy wait/delay to let window expire
  const start = Date.now();
  while (Date.now() - start < 10) {
    // wait 10ms
  }

  let resShort3 = rateLimit(ip3, 1, 5);
  assert("Request after window expiration is allowed", resShort3.success);

  console.log(`----------------------------------------------------------------`);
  console.log(`Rate Limiter Tests Results: ${passedTests}/${totalTests} Passed.`);
  return passedTests === totalTests;
}
