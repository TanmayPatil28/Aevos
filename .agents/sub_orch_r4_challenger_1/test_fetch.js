const fs = require('fs');

async function testLimits() {
  console.log("Testing File Size Limit...");
  
  // Create a 6MB dummy file
  const largeBuffer = Buffer.alloc(6 * 1024 * 1024);
  const largeBlob = new Blob([largeBuffer], { type: 'application/pdf' });
  
  const fdLarge = new FormData();
  fdLarge.append('file', largeBlob, 'large.pdf');

  try {
    const res1 = await fetch('http://localhost:3000/api/parse/resume', {
      method: 'POST',
      body: fdLarge
    });
    console.log("Status for >5MB file:", res1.status);
    const data1 = await res1.json();
    console.log("Response:", data1);
  } catch (e) {
    console.error(e);
  }

  console.log("\nTesting MIME Type Limit...");
  
  // Create a dummy png file
  const badTypeBuffer = Buffer.alloc(1024);
  const badTypeBlob = new Blob([badTypeBuffer], { type: 'image/png' });
  
  const fdBad = new FormData();
  fdBad.append('file', badTypeBlob, 'image.png');

  try {
    const res2 = await fetch('http://localhost:3000/api/parse/resume', {
      method: 'POST',
      body: fdBad
    });
    console.log("Status for non-PDF file:", res2.status);
    const data2 = await res2.json();
    console.log("Response:", data2);
  } catch (e) {
    console.error(e);
  }
}

testLimits();
