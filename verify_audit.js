const fs = require("fs");

function verifyAudit() {
  const content = fs.readFileSync("navbar_destruction_audit.md", "utf-8");

  const sections = [
    "Component Coupling & Monolithic Structure",
    "Authentication State Architecture",
    "Client-Side Rendering (CSR) Bloat",
    "Global State Management & Hydration",
    "Animation & Physics Overhead",
    "Performance & Event Listeners",
    "Accessibility (a11y) & ARIA Compliance",
    "Routing & Navigation Resiliency",
    "Code Duplication & DRY Violations",
    "Theming, Styling, & Magic Numbers",
    "Error Handling & Component Fallbacks",
    "Semantic HTML & DOM Depth",
    "Mobile UX & Viewport Responsiveness",
    "Security & Context Exposure",
    "Developer Experience (DX) & Extensibility"
  ];

  for (const sec of sections) {
    if (!content.includes(sec)) {
      console.error(`Missing section: ${sec}`);
      process.exit(1);
    }
  }

  // Find all findings
  // A finding starts with "- **Issue ID**: "
  const findings = content.match(/- \*\*Issue ID\*\*: [\s\S]*?(?=- \*\*Issue ID\*\*|$)/g) || [];
  
  if (findings.length < 100) {
    console.error(`Total findings: ${findings.length}. Expected >= 100.`);
    process.exit(1);
  }

  const fields = [
    /- \*\*Issue ID\*\*: .*/,
    /- \*\*Severity\*\*: (Critical|High|Medium|Low)/,
    /- \*\*Category\*\*: (UX|IA|Frontend|Backend|Product|Accessibility|Performance|Growth|Security)/,
    /- \*\*Problem\*\*: .*/,
    /- \*\*Why It Is A Problem\*\*: .*/,
    /- \*\*User Impact\*\*: .*/,
    /- \*\*Technical Impact\*\*: .*/,
    /- \*\*Future Scale Impact\*\*: .*/,
    /- \*\*Evidence\*\*: .*/,
    /- \*\*Confidence Level\*\*: \d+%/
  ];

  for (let i = 0; i < findings.length; i++) {
    const finding = findings[i];
    for (const field of fields) {
      if (!field.test(finding)) {
        console.error(`Finding ${i + 1} missing or malformed field: ${field}`);
        console.error("--- Finding content ---");
        console.error(finding);
        process.exit(1);
      }
    }
  }

  console.log("Audit report verified successfully!");
  process.exit(0);
}

verifyAudit();
