import { eligibilityEngine } from "../../lib/career/eligibilityEngine";
import { CAREER_PATHS } from "../../lib/career/careerRegistry";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m"
};

let totalTests = 0;
let passedTests = 0;

function section(name: string) {
  console.log(`\n${colors.bright}${colors.blue}=== SECTION: ${name} ===${colors.reset}`);
}

function assert(description: string, condition: boolean, details?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${colors.green}✓ PASS:${colors.reset} ${description}`);
  } else {
    console.error(`  ${colors.red}✗ FAIL:${colors.reset} ${description}`);
    if (details) {
      console.error(`    ${colors.yellow}Details:${colors.reset} ${details}`);
    }
  }
}

export function runCareerTests(): boolean {
  console.log(`\n${colors.bright}${colors.blue}GradeFlow Career Eligibility & Registry Verification Suite${colors.reset}`);
  console.log(`----------------------------------------------------------------`);

  section("Career Registry Options & Structural Integrity");

  assert("CAREER_PATHS contains exactly 3 locked MVP roles", 
    Object.keys(CAREER_PATHS).length === 3 && 
    "SDE" in CAREER_PATHS && 
    "DATA_SCIENTIST" in CAREER_PATHS && 
    "DEVOPS" in CAREER_PATHS
  );

  assert("SDE role target CGPA is 8.0", CAREER_PATHS.SDE.cgpaTargetRecommendation === 8.0);
  assert("SDE has Data Structures & Algorithms skill listed", 
    CAREER_PATHS.SDE.coreSkills.some(s => s.name === "Data Structures & Algorithms")
  );
  assert("DATA_SCIENTIST has Probability & Applied Statistics skill listed", 
    CAREER_PATHS.DATA_SCIENTIST.coreSkills.some(s => s.name === "Probability & Applied Statistics")
  );
  assert("DEVOPS has Kubernetes & Orchestration skill listed", 
    CAREER_PATHS.DEVOPS.coreSkills.some(s => s.name === "Kubernetes & Orchestration")
  );

  section("Company Eligibility Scenarios");

  // High GPA / Zero Backlogs
  const eliteStudent = eligibilityEngine.evaluate({
    cgpa: 9.2,
    backlogs: 0,
    earnedCredits: 85
  });
  assert("Elite student overall status is ELIGIBLE", eliteStudent.overallStatus === "ELIGIBLE");
  assert("Elite student qualifies for all 6 standard recruiters", eliteStudent.eligibleCompaniesCount === 6);

  // Borderline GPA / No Backlogs
  const borderlineStudent = eligibilityEngine.evaluate({
    cgpa: 7.8, // FAANG cutoff is 8.0
    backlogs: 0,
    earnedCredits: 80
  });
  assert("Borderline student is BORDERLINE overall due to FAANG", borderlineStudent.overallStatus === "BORDERLINE");
  assert("Borderline student qualifies for 5 standard recruiters", borderlineStudent.eligibleCompaniesCount === 5);
  assert("Borderline student is BORDERLINE for FAANG", 
    borderlineStudent.companies.find(c => c.name.includes("FAANG"))?.status === "BORDERLINE"
  );

  // Low GPA student
  const lowGpaStudent = eligibilityEngine.evaluate({
    cgpa: 5.5,
    backlogs: 0,
    earnedCredits: 60
  });
  assert("Low GPA student is INELIGIBLE overall", lowGpaStudent.overallStatus === "INELIGIBLE");
  assert("Low GPA student is ineligible for all recruiters", lowGpaStudent.eligibleCompaniesCount === 0);

  // Backlog Student
  const backlogStudent = eligibilityEngine.evaluate({
    cgpa: 7.5,
    backlogs: 1, // TCS/Infosys/Accenture allow 0, Cognizant/Wipro allow 1
    earnedCredits: 65
  });
  assert("Student with 1 backlog is INELIGIBLE overall", backlogStudent.overallStatus === "INELIGIBLE");
  assert("Student with 1 backlog is ELIGIBLE for Cognizant", 
    backlogStudent.companies.find(c => c.name.includes("Cognizant"))?.status === "ELIGIBLE"
  );
  assert("Student with 1 backlog is ELIGIBLE for Wipro", 
    backlogStudent.companies.find(c => c.name.includes("Wipro"))?.status === "ELIGIBLE"
  );
  assert("Student with 1 backlog is INELIGIBLE for TCS", 
    backlogStudent.companies.find(c => c.name.includes("TCS"))?.status === "INELIGIBLE"
  );

  console.log(`----------------------------------------------------------------`);
  console.log(`Career Tests Results: ${passedTests}/${totalTests} Passed.`);
  return passedTests === totalTests;
}
