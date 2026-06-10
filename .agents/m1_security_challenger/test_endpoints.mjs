async function testEndpoint(url) {
  try {
    const res = await fetch(url, { method: 'POST', body: JSON.stringify({ query: 'test' }) });
    console.log(`Endpoint: ${url} -> Status: ${res.status}`);
  } catch (e) {
    console.log(`Endpoint: ${url} -> Error: ${e.message}`);
  }
}

const endpoints = [
  'http://localhost:3000/api/jarvis',
  'http://localhost:3000/api/chat',
  'http://localhost:3000/api/terminal/ai'
];

async function run() {
  for (const ep of endpoints) {
    await testEndpoint(ep);
  }
}

run();
