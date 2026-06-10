const puppeteer = require('puppeteer');

(async () => {
  console.log("Starting Puppeteer...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  console.log("Navigating to http://localhost:3001/dashboard...");
  
  // Set local storage before navigation
  await page.goto('http://localhost:3001');
  await page.evaluate(() => {
    const semesters = Array.from({ length: 15 }, (_, i) => ({
      semester: i + 1,
      sgpa: 8.0,
      credits: 20,
      earnedCredits: 20
    }));
    
    const mockState = {
      state: {
        presetId: 'sppu',
        academic: { currentCgpa: 8.0, targetCgpa: 9.0, earnedCredits: 300 },
        semesterHistory: semesters,
        identity: { hasAuthoritativeData: true, institution: "test" },
        interventions: []
      },
      version: 0
    };
    
    window.localStorage.setItem('gradeflow-usm-storage', JSON.stringify(mockState));
  });

  await page.goto('http://localhost:3001/dashboard');

  console.log("Waiting a couple seconds for React to hydrate and useEffect to run...");
  await new Promise(r => setTimeout(r, 3000));

  const storageAfter = await page.evaluate(() => {
    return window.localStorage.getItem('gradeflow-usm-storage');
  });

  if (storageAfter) {
    const parsed = JSON.parse(storageAfter);
    if (parsed.state && parsed.state.semesterHistory && parsed.state.semesterHistory.length === 15) {
      console.log("✅ SUCCESS: Local storage was NOT wiped. 15 semesters remain.");
    } else {
      console.log("❌ FAIL: Local storage exists but semesterHistory was modified.");
      console.log(storageAfter);
      process.exit(1);
    }
  } else {
    console.log("❌ FAIL: Local storage was completely wiped!");
    process.exit(1);
  }

  await browser.close();
  process.exit(0);
})();
