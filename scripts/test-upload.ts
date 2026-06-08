import fs from 'fs';
import path from 'path';

async function test() {
  try {
    const filePath = "C:/Users/Tanmay/OneDrive/BTech-AIML/Study Material - (SEM-3) - Copy (2)/New folder/something EXTRA/Snehal_Java_Resume[1].pdf";
    const fileBuffer = fs.readFileSync(filePath);
    const blob = new Blob([fileBuffer], { type: 'application/pdf' });
    
    const formData = new FormData();
    formData.append('file', blob, 'resume.pdf');

    const res = await fetch("http://localhost:3000/api/parse/resume", {
      method: "POST",
      body: formData
    });
    
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch(e) {
    console.error("Fetch Error:", e);
  }
}
test();
