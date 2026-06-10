import { POST as parseResume } from '../app/api/parse/resume/route';
import { POST as jarvis } from '../app/api/jarvis/route';
import { POST as terminalAi } from '../app/api/terminal/ai/route';

process.env.GEMINI_API_KEY = "test_key";
process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test";

async function runTests() {
  console.log("Testing parse/resume limits...");
  
  try {
    const formData1 = new FormData();
    const file1 = new File(["dummy content"], "test.txt", { type: "text/plain" });
    formData1.append("file", file1);
    const req1 = new Request("http://localhost/api/parse/resume", {
      method: "POST",
      body: formData1
    });
    const res1 = await parseResume(req1);
    console.log("Resume Type Check (Expected 400):", res1.status, await res1.json());
  } catch (e: any) {
    console.error("Resume Type Check error:", e.message);
  }

  try {
    const formData2 = new FormData();
    const largeBuffer = new Uint8Array(6 * 1024 * 1024).fill(0);
    const file2 = new File([largeBuffer], "large.pdf", { type: "application/pdf" });
    formData2.append("file", file2);
    const req2 = new Request("http://localhost/api/parse/resume", {
      method: "POST",
      body: formData2
    });
    const res2 = await parseResume(req2);
    console.log("Resume Size Check (Expected 400):", res2.status, await res2.json());
  } catch (e: any) {
    console.error("Resume Size Check error:", e.message);
  }

  console.log("\nTesting terminal AI... (ensuring initialization doesn't throw)");
  try {
    const reqTerminal = new Request("http://localhost/api/terminal/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: "Hello",
        context: {}
      })
    });
    const resTerminal = await terminalAi(reqTerminal);
    console.log("Terminal Status:", resTerminal.status);
  } catch (e: any) {
    console.error("Terminal Check error:", e.message);
  }

  console.log("\nTesting jarvis... (ensuring no sync write errors)");
  try {
    const reqJarvis = new Request("http://localhost/api/jarvis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: "My target company is Microsoft",
        studentContext: "Test"
      })
    });
    const resJarvis = await jarvis(reqJarvis);
    console.log("Jarvis Status:", resJarvis.status);
  } catch (e: any) {
    console.error("Jarvis Check error:", e.message);
  }
}

runTests().catch(console.error);
