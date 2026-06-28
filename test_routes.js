const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const http = require('http');

const outputDir = `c:\\Users\\Tanmay\\OneDrive\\Desktop\\GradeFlow\\.agents\\teamwork_preview_explorer_dynamic_mapping\\screenshots`;
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function checkServer() {
  return new Promise((resolve) => {
    http.get('http://localhost:3000', (res) => {
      resolve(true);
    }).on('error', (e) => {
      resolve(false);
    });
  });
}

async function run() {
  console.log('Checking if server is ready...');
  let serverReady = false;
  for (let i = 0; i < 30; i++) {
    serverReady = await checkServer();
    if (serverReady) {
      console.log('Server is ready!');
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Waiting for server...', i);
  }

  if (!serverReady) {
    console.error('Server is not running on http://localhost:3000');
    process.exit(1);
  }

  console.log('Launching Puppeteer browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const routes = [
    '/',
    '/overview',
    '/ledger',
    '/career',
    '/records',
    '/forecasting',
    '/identity',
    '/dashboard',
    '/showcase',
    '/attendance',
    '/backlog',
    '/calculator',
    '/internships',
    '/placement',
    '/onboarding',
    '/research',
    '/dev'
  ];

  const results = [];

  for (const route of routes) {
    const url = `http://localhost:3000${route}`;
    console.log(`Navigating to ${url}...`);
    try {
      const response = await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
      
      // Wait another 2 seconds for any dynamic content/hydration
      await new Promise(resolve => setTimeout(resolve, 2000));

      const finalUrl = page.url();
      const title = await page.title();
      
      // Get some text content
      const bodyText = await page.evaluate(() => document.body.innerText);
      const h1Text = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        return h1 ? h1.innerText : 'No H1 found';
      });

      // Check if it's a 404 or 410 or has specific error indicators
      const is404 = bodyText.includes('404') || bodyText.toLowerCase().includes('page not found') || title.includes('404') || (response && response.status() === 404);
      const status = response ? response.status() : 'unknown';

      const screenshotName = route.replace(/\//g, '_').substring(1) || 'root';
      const screenshotPath = path.join(outputDir, `${screenshotName}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });

      results.push({
        requestedRoute: route,
        finalUrl,
        status,
        title,
        h1: h1Text,
        is404,
        screenshot: `${screenshotName}.png`,
        textSnippet: bodyText.substring(0, 500).replace(/\n/g, ' ')
      });

      console.log(`Done ${route}: Status ${status}, Final URL ${finalUrl}, 404: ${is404}`);
    } catch (err) {
      console.error(`Error navigating to ${route}:`, err.message);
      results.push({
        requestedRoute: route,
        error: err.message,
        is404: false
      });
    }
  }

  await browser.close();

  fs.writeFileSync(
    path.join(outputDir, '..', 'navigation_results.json'),
    JSON.stringify(results, null, 2)
  );
  console.log('Results saved to navigation_results.json');
}

run().catch(e => {
  console.error('Script failed:', e);
  process.exit(1);
});
