const fs = require('fs');

const path = 'c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/app/(workspace)/planner/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// The missing wrappers from earlier
const missingWrappers = `
      <div className="relative z-10 w-full px-4 md:px-8 max-w-[1400px] mx-auto">
        <WorkspaceContent className="!pt-0 !px-0 bg-transparent">
          <WorkspaceSection>
            <div className="flex flex-col gap-12 items-start w-full max-w-5xl mx-auto">
`;

// Insert the wrappers right after the <section> block ends.
// Let's find: `      {/* ━━━ RIGHT PANE (Controls / Side Panel) ━━━ */}`
code = code.replace(
  /\{\/\* ━━━ RIGHT PANE \(Controls \/ Side Panel\) ━━━ \*\/\}/,
  missingWrappers + '\n      {/* ━━━ RIGHT PANE (Controls / Side Panel) ━━━ */}'
);

fs.writeFileSync(path, code);
console.log("Fix complete");
