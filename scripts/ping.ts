async function ping() {
  try {
    const res = await fetch("http://localhost:3000/api/career/skill-gap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userSkills: ["React"], targetRole: "Frontend Developer" })
    });
    
    console.log("Status:", res.status);
    console.log("Headers:", Object.fromEntries(res.headers.entries()));
    const text = await res.text();
    console.log("Body length:", text.length);
    console.log("Body snippet:", text.substring(0, 500));
  } catch(e) {
    console.error("Fetch failed:", e);
  }
}
ping();
