const fetch = require('node-fetch');

async function testNarrative() {
  const response = await fetch('http://localhost:3002/api/narrative', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: "I chose to study overnight for the exam." })
  });

  console.log('Status:', response.status);
  console.log('Headers:', response.headers.raw());
  
  if (!response.body) {
    console.log('No response body');
    return;
  }

  const reader = response.body;
  let chunkCount = 0;
  
  reader.on('readable', () => {
    let chunk;
    while (null !== (chunk = reader.read())) {
      chunkCount++;
      console.log(`Chunk ${chunkCount}:`, chunk.toString());
    }
  });

  reader.on('end', () => {
    console.log('Stream ended. Total chunks:', chunkCount);
    process.exit(0);
  });
}

testNarrative().catch(console.error);
