const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  
  let errors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      errors.push("Browser Error: " + text);
    }
  });
  page.on('pageerror', err => {
    errors.push("Page Error: " + err.toString());
  });

  // First visit to inject localStorage
  await page.goto('http://localhost:3000/dashboard');
  
  await page.evaluate(() => {
    localStorage.setItem('usm-store', JSON.stringify({
      state: {
        identity: {
          status: "imported",
          sourceType: "database_sync",
          lastUpdatedAt: new Date().toISOString(),
          isVerified: true,
          hasAuthoritativeData: true,
        },
        semesterHistory: [
          { semester: 1, sgpa: 8.5, credits: 20, earnedCredits: 20 },
          { semester: 2, sgpa: 8.2, credits: 20, earnedCredits: 20 }
        ],
        courses: [
          { id: "c1", code: "CS101", name: "Programming", semester: 1, credits: 4, grade: "A" }
        ],
        workspaceUi: { mode: "academic" }
      },
      version: 0
    }));
  });

  console.log("Local storage set. Reloading to trigger hydration mismatch if present...");
  
  // Reload dashboard
  await page.reload({ waitUntil: 'networkidle0' });
  
  // Reload timeline
  await page.goto('http://localhost:3000/timeline', { waitUntil: 'networkidle0' });

  // Output all errors
  if (errors.length > 0) {
    console.log("Found Errors during refresh:");
    errors.forEach(e => console.log(e));
  } else {
    console.log("No Errors Found.");
  }
  
  await browser.close();
  process.exit(0);
})();
