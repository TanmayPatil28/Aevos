const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

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
  console.log('Building project...');
  const build = spawn('npm.cmd', ['run', 'build'], { shell: true, stdio: 'inherit' });
  await new Promise(resolve => build.on('close', resolve));

  console.log('Starting server...');
  const server = spawn('npm.cmd', ['run', 'start'], { shell: true });
  
  server.stdout.on('data', (data) => console.log(`stdout: ${data}`));
  server.stderr.on('data', (data) => console.error(`stderr: ${data}`));

  let serverReady = false;
  for (let i = 0; i < 60; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Checking server...', i);
    serverReady = await checkServer();
    if (serverReady) {
      console.log('Server is ready!');
      break;
    }
  }

  if (!serverReady) {
    console.log('Server failed to start');
    server.kill();
    process.exit(1);
  }

  // wait an extra 2 seconds for next.js hydration
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log('Taking screenshot...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(__dirname, 'dashboard-screenshot.png'), fullPage: true });
  await browser.close();

  console.log('Killing server...');
  spawn('taskkill', ['/pid', server.pid, '/f', '/t'], { shell: true });
  console.log('Done');
  process.exit(0);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
