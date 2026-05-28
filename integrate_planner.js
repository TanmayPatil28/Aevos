const fs = require('fs');

const path = 'c:/Users/Tanmay/OneDrive/Desktop/GradeFlow/gradeflow/app/(workspace)/planner/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add Imports
const importsToAdd = `
import AcademicOptimizerModule from "@/components/planner/AcademicOptimizerModule";
import AttendanceIntelligenceModule from "@/components/planner/AttendanceIntelligenceModule";
import BacklogRecoveryModule from "@/components/planner/BacklogRecoveryModule";
import ProfileOptimizerModule from "@/components/planner/ProfileOptimizerModule";
`;

if (!code.includes("AcademicOptimizerModule")) {
  code = code.replace(
    'import CareerHubModule from "@/components/planner/CareerHubModule";',
    `import CareerHubModule from "@/components/planner/CareerHubModule";${importsToAdd}`
  );
}

// 2. Replace the old CalculationBreakdown and Expert Insight sections.
// I will locate the `<CalculationBreakdown` block up to `<!-- ACTION BUTTONS -->` or similar, 
// and replace it with the new components.

const searchStart = /<CalculationBreakdown[\s\S]*?type="cgpa"\s*\/>/;

if (code.match(searchStart)) {
  code = code.replace(searchStart, `
                {/* 1. Academic Optimizer Engine (Includes Statutory Matrix logic inside or below) */}
                <AcademicOptimizerModule 
                  currentCgpa={parseFloat(currentCGPA || "0")} 
                  targetCgpa={parseFloat(targetCGPA || "0")} 
                  totalSemesters={parseInt(totalSemesters || "8")} 
                  completedSemesters={parseInt(completedSemesters || "0")} 
                  result={result} 
                />

                {/* 2. Attendance Intelligence Engine */}
                <AttendanceIntelligenceModule />

                {/* 3. Backlog Recovery Engine */}
                <BacklogRecoveryModule />

                {/* 4. Profile Branding Assistant */}
                <ProfileOptimizerModule />
  `);
}

// 3. Remove the old Expert Insight blocks since AcademicOptimizerModule handles risk analysis.
const expertInsightRegex = /\{\/\* ━━━ EXPERT INSIGHT \+ CGPA JOURNEY ━━━ \*\/\}[\s\S]*?<\/Link>\s*<\/MotionCard>\s*<\/div>/;
code = code.replace(expertInsightRegex, "");

fs.writeFileSync(path, code);
console.log("Integration complete");
