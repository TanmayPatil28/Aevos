const fs = require('fs');

const optimizerPath = 'c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/components/planner/AcademicOptimizerModule.tsx';
let optimizerCode = fs.readFileSync(optimizerPath, 'utf8');

optimizerCode = optimizerCode.replace(
  /interface AcademicOptimizerProps \{/,
  `import { UniversityPreset } from "@/lib/presets";\n\ninterface AcademicOptimizerProps {\n  preset: UniversityPreset;`
);

optimizerCode = optimizerCode.replace(
  /export default function AcademicOptimizerModule\(\{ currentCgpa, targetCgpa, totalSemesters, completedSemesters, result \}: AcademicOptimizerProps\) \{/,
  `export default function AcademicOptimizerModule({ preset, currentCgpa, targetCgpa, totalSemesters, completedSemesters, result }: AcademicOptimizerProps) {`
);

optimizerCode = optimizerCode.replace(
  /<CalculationBreakdown[\s\S]*?\/>/,
  `<CalculationBreakdown 
            preset={preset}
            type="cgpa"
            semesters={[
              {
                semesterName: "Completed Semesters (Cumulative)",
                credits: result.totalCredits || 0,
                sgpa: currentCgpa || 0
              },
              ...Array.from({ length: result.remainingSems || (totalSemesters - completedSemesters) }).map((_, i) => ({
                semesterName: \`Semester \${completedSemesters + i + 1} (Planned)\`,
                credits: result.creditsPerSem || 20,
                sgpa: result.requiredGPA
              }))
            ]}
          />`
);

fs.writeFileSync(optimizerPath, optimizerCode);

const plannerPath = 'c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/app/(workspace)/planner/page.tsx';
let plannerCode = fs.readFileSync(plannerPath, 'utf8');

plannerCode = plannerCode.replace(
  /<AcademicOptimizerModule\s*currentCgpa/,
  `<AcademicOptimizerModule \n                  preset={activePreset!}\n                  currentCgpa`
);

fs.writeFileSync(plannerPath, plannerCode);

console.log("Fixed props");
