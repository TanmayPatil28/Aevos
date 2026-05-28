const fs = require('fs');

const path = 'c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/app/(workspace)/planner/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add Imports
if (!code.includes("CareerHubModule")) {
  code = code.replace(
    'import Input from "@/components/ui/Input";',
    `import Input from "@/components/ui/Input";\nimport CareerHubModule from "@/components/planner/CareerHubModule";\nimport { ShieldAlert, Activity, BookOpen } from "lucide-react";`
  );
}

// 2. Remove ActiveTab State
code = code.replace(
  /const \[activeTab, setActiveTab\] = useState<'strategy' \| 'attendance'>\('strategy'\);/g,
  ""
);

// 3. Remove Sticky Dynamic Island Navigation
code = code.replace(
  /\{\/\* Sticky Dynamic Island Navigation \*\/\}(.|\n)*?\{\/\* ━━━ RIGHT PANE \(Controls \/ Side Panel\) ━━━ \*\/\}/gm,
  `{/* ━━━ RIGHT PANE (Controls / Side Panel) ━━━ */}`
);

// 4. Remove AnimatePresence and activeTab conditional logic
// We need to replace:
// <AnimatePresence mode="wait">
//   {activeTab === "strategy" ? (
//     <motion.div key="strategy" ...>
// 
// With just:
// <div className="w-full flex flex-col gap-16">
code = code.replace(
  /<AnimatePresence mode="wait">\s*\{activeTab === "strategy" \? \(\s*<motion\.div key="strategy" initial=\{\{ opacity: 0, y: 20 \}\} animate=\{\{ opacity: 1, y: 0 \}\} exit=\{\{ opacity: 0, y: -20 \}\} className="w-full">/m,
  `<div className="w-full flex flex-col gap-16 mt-8">`
);

// 5. Replace Attendance OS Mock and trailing conditionals
// Search for `) : (` which separated the activeTab branches
code = code.replace(
  /\)\s*:\s*\(\s*<motion\.div key="attendance"(.|\n)*?\{\/\* ━━━ BOTTOM NAVIGATION ━━━ \*\/\}/gm,
  `</div>
  
  {/* CAREER HUB & INTELLIGENCE MODULES */}
  <div className="flex flex-col gap-8 w-full mt-16" id="career-hub">
    <CareerHubModule 
      projectedCgpa={result?.requiredGPA ? parseFloat(targetCGPA) : parseFloat(currentCGPA || "0")} 
      activeBacklogs={0} 
    />
  </div>

  {/* ━━━ BOTTOM NAVIGATION ━━━ */}`
);

// 6. Fix Flex Layout
// We need to change flex-row to flex-col for continuous flow.
code = code.replace(
  /<div className="flex flex-col xl:flex-row gap-8 items-start w-full">/,
  `<div className="flex flex-col gap-12 items-start w-full max-w-5xl mx-auto">`
);

// 7. Remove sticky from right pane
code = code.replace(
  /lg:sticky lg:top-28 h-fit relative z-10 w-full order-first xl:order-last/,
  `relative z-10 w-full order-first`
);

fs.writeFileSync(path, code);
console.log("Refactor complete");
