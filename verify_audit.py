import re
import sys

def verify_audit():
    with open("navbar_destruction_audit.md", "r", encoding="utf-8") as f:
        content = f.read()

    sections = [
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
    ]

    for sec in sections:
        if sec not in content:
            print(f"Missing section: {sec}")
            sys.exit(1)

    # Find all findings
    # A finding starts with "- **Issue ID**: "
    findings = re.findall(r'- \*\*Issue ID\*\*:.*?(?=- \*\*Issue ID\*\*|\Z)', content, re.DOTALL)
    
    if len(findings) < 100:
        print(f"Total findings: {len(findings)}. Expected >= 100.")
        sys.exit(1)

    fields = [
        r"- \*\*Issue ID\*\*: .*",
        r"- \*\*Severity\*\*: (Critical|High|Medium|Low)",
        r"- \*\*Category\*\*: (UX|IA|Frontend|Backend|Product|Accessibility|Performance|Growth|Security)",
        r"- \*\*Problem\*\*: .*",
        r"- \*\*Why It Is A Problem\*\*: .*",
        r"- \*\*User Impact\*\*: .*",
        r"- \*\*Technical Impact\*\*: .*",
        r"- \*\*Future Scale Impact\*\*: .*",
        r"- \*\*Evidence\*\*: .*",
        r"- \*\*Confidence Level\*\*: \d+%"
    ]

    for i, finding in enumerate(findings):
        for field in fields:
            if not re.search(field, finding):
                print(f"Finding {i+1} missing or malformed field: {field}")
                print("--- Finding content ---")
                print(finding)
                sys.exit(1)

    print("Audit report verified successfully!")
    sys.exit(0)

if __name__ == "__main__":
    verify_audit()
