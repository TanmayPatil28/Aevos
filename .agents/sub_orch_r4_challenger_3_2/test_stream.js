const http = require('http');

async function testStream() {
  console.log("Testing /api/narrative stream...");
  try {
    const response = await fetch('http://localhost:3000/api/narrative', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        rubric: { id: "1", criteria: [{ id: "c1", description: "Clarity", maxPoints: 10 }] },
        evaluations: [{ criteriaId: "c1", score: 8, feedback: "Good clarity" }],
        studentInfo: { id: "s1", name: "John Doe" }
      })
    });

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
      const text = await response.text();
      console.error(`Response text: ${text}`);
      return;
    }

    console.log("Response headers:", response.headers);

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let chunkCount = 0;
    let totalLength = 0;
    const timestamps = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunkCount++;
      timestamps.push(Date.now());
      const chunkText = decoder.decode(value, { stream: true });
      totalLength += chunkText.length;
      console.log(`Chunk ${chunkCount}: ${chunkText.length} bytes`);
    }

    console.log(`\nStream complete. Received ${chunkCount} chunks, total ${totalLength} bytes.`);
    
    // Check if it was streaming by looking at timestamps
    if (timestamps.length > 1) {
      const durations = [];
      for (let i = 1; i < timestamps.length; i++) {
        durations.push(timestamps[i] - timestamps[i-1]);
      }
      console.log(`Durations between chunks (ms): ${durations.join(', ')}`);
      
      const isMock = durations.every(d => d > 90 && d < 110); // Example check for hardcoded 100ms
      if (isMock) {
        console.log("WARNING: Looks like a hardcoded mock delay (consistent ~100ms between chunks).");
      } else {
        console.log("Looks like a genuine stream (variable delay).");
      }
    } else {
      console.log("Received 1 or fewer chunks. Not a stream.");
    }
    
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testStream();
