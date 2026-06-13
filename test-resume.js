const fs = require('fs');
const path = require('path');

async function test() {
  const formData = new FormData();
  
  // Create a dummy PDF file (just a text file with .pdf extension for testing mime types)
  const dummyPdfPath = path.join(__dirname, 'dummy.pdf');
  fs.writeFileSync(dummyPdfPath, '%PDF-1.4 dummy content');
  
  const blob = new Blob([fs.readFileSync(dummyPdfPath)], { type: 'application/pdf' });
  formData.append('file', blob, 'dummy.pdf');
  formData.append('targetJD', 'Frontend Developer with React and TypeScript');
  
  try {
    console.log('Sending request to local API...');
    const res = await fetch('http://localhost:3000/api/parse/resume', {
      method: 'POST',
      body: formData
    });
    
    const text = await res.text();
    console.log('Response Status:', res.status);
    console.log('Response Body:', text);
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
