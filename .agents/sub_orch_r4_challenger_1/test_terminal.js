async function testTerminalAI() {
  console.log("Testing Terminal AI Route...");
  try {
    const res = await fetch('http://localhost:3000/api/terminal/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: "Hello, who are you?",
        context: {
          cgpa: "9.0",
          backlogs: "0",
          cwd: "/home/user"
        }
      })
    });
    console.log("Status:", res.status);
    
    const text = await res.text();
    console.log("Response text (first 100 chars):", text.slice(0, 100));
  } catch (e) {
    console.error(e);
  }
}

testTerminalAI();
