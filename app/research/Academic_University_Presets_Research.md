# Universal University-Driven Academic Simulation Engine: Architectural Specifications and Institutional Rule Data

The following architectural specifications detail the granular academic parameters, grading methodologies, evaluation models, and progression rules for twenty-three target institutional systems. This verified dataset provides the foundational logic layer required to power a scalable academic simulation engine, facilitating dynamic Grade Point Average (GPA) calculations, backlog tracking, and university-specific academic predictions.

By mapping the highly heterogeneous landscape of university assessment protocols, this research establishes an implementation-ready abstraction layer for each institution. The analysis captures localized anomalies, piecewise conversion equations, hybrid relative-absolute grading constraints, and statistical normalizations required to ensure the simulation engine operates with high accuracy across varying academic jurisdictions.

---

## 1. Maharashtra Academic Systems

### 1.1 Savitribai Phule Pune University (SPPU) & Sinhgad College of Engineering

Savitribai Phule Pune University (SPPU) operates a Choice-Based Credit System (CBCS) heavily reliant on a 10-point absolute grading scale. Sinhgad College of Engineering, acting as an affiliated institution, inherits this precise academic configuration without deviation. The simulation engine must account for a grading architecture that evaluates students based on absolute marks mapped mathematically to a 10-point scale.

For backward compatibility and professional transcript generation, the engine must execute a specific CGPA-to-Percentage conversion equation: $Percentage = (CGPA - 0.75) \times 10$. This linear offset implies that a perfect 10 CGPA translates to 92.5%, penalizing the absolute ceiling but providing a normalized baseline for corporate recruitment. Progression logic—governed by Allowed To Keep Terms (ATKT) rules—mandates that students must earn a minimum of 50% of the total credits from the preceding academic year to progress to the next year. A critical architectural edge case for the simulation engine involves re-examinations; if a student clears a backlog in a subsequent attempt, the system must invoke a grade penalty, capping the maximum achievable grade one full level below the regular exam equivalent.

#### SPPU Grading Scale

| Marks Range | Grade Description | Grade Letter | Grade Points | Status |
| :---: | :---: | :---: | :---: | :---: |
| 80–100 | Outstanding | O | 10 | Pass |
| 70–79 | Excellent | A+ | 9 | Pass |
| 60–69 | Very Good | A | 8 | Pass |
| 55–59 | Good | B+ | 7 | Pass |
| 50–54 | Above Average | B | 6 | Pass |
| 45–49 | Average | C | 5 | Pass |
| 40–44 | Pass | P | 4 | Pass |
| 0–39 | Fail | F | 0 | Fail |

#### SPPU Preset Definition

```json
{
  "id": "sppu_sinhgad",
  "name": "Savitribai Phule Pune University",
  "gradingSystem": "10-point CBCS",
  "evaluationModel": "absolute",
  "gradeScale": [
    {"min": 80, "max": 100, "grade": "O", "points": 10, "pass": true},
    {"min": 70, "max": 79, "grade": "A+", "points": 9, "pass": true},
    {"min": 60, "max": 69, "grade": "A", "points": 8, "pass": true},
    {"min": 55, "max": 59, "grade": "B+", "points": 7, "pass": true},
    {"min": 50, "max": 54, "grade": "B", "points": 6, "pass": true},
    {"min": 45, "max": 49, "grade": "C", "points": 5, "pass": true},
    {"min": 40, "max": 44, "grade": "P", "points": 4, "pass": true},
    {"min": 0, "max": 39, "grade": "F", "points": 0, "pass": false}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "(SGPA - 0.75) * 10",
  "cgpaToPercentage": "(CGPA - 0.75) * 10",
  "creditStructure": {
    "totalCreditsRequired": 170,
    "auditCourses": "Zero-credit mandatory courses graded as PP (Pass) or NP (Not Pass)",
    "excludedCredits": "Audit course credits do not factor into CGPA denominator"
  },
  "passRules": {
    "minInternalMarks": "Course-dependent, typically 40%",
    "minExternalMarks": "Course-dependent, typically 40%",
    "minOverallMarks": 40,
    "minSGPA": 4.0
  },
  "backlogPolicy": {
    "atktRules": "Minimum 50% credits must be cleared for year progression",
    "retakePenalty": "Grade downgraded by one level in re-examination",
    "replacementPolicy": "New passing grade overwrites F grade point value but retains transcript marker"
  },
  "assessmentScheme": {
    "components": ["In-Semester Evaluation (ISE)", "End-Semester Evaluation (ESE)"],
    "split": "30/70 internal/external split for standard theory courses",
    "theoryPracticalSeparation": true
  },
  "metadata": {
    "type": "State University",
    "academicRegulationYear": "2019 Pattern",
    "affiliatedAuthority": "UGC/AICTE"
  },
  "specialFeatures": [
    "Linear offset CGPA-to-Percentage conversion equation",
    "Grade penalty on re-examinations",
    "Audit courses excluded from CGPA calculation"
  ]
}
```

---

### 1.2 Mumbai University (MU)

Mumbai University (MU) enforces a 10-point Choice-Based Credit and Grading System (CBCGS) for engineering programs. A critical computational anomaly that the simulation engine must handle natively is MU’s piecewise conversion formula for calculating percentages from the CGPA. Unlike standard linear conversions, MU's algorithm changes the multiplier based on the performance tier.

The simulation engine must execute the following conditional logic:

*   If $CGPA < 7.0$, the conversion formula is $Percentage = 7.1 \times CGPA + 12$.
*   If $CGPA \ge 7.0$, the conversion formula is $Percentage = 7.4 \times CGPA + 12$.

*(Note: Older non-engineering syllabus iterations utilized alternate formulas such as $7.1 \times CGPA + 11$ or $7.25 \times CGPA + 11$, which the legacy preset registry must retain for historical transcript simulations).*

Progression relies on a strict ATKT limit, restricting students to a maximum of four backlogs (Keep Term subjects) across an academic year to secure promotion to the next year. Furthermore, minimum passing thresholds are enforced independently on Internal Assessment (IA) and Semester-End Examination (SEE); a student must achieve at least 40% in each isolated component to pass the overarching course. Failure to clear a component results in an isolated retake requirement rather than a full course repetition.

#### MU Grading Scale

| Marks Range | Grade Description | Grade Letter | Grade Points | Status |
| :---: | :---: | :---: | :---: | :---: |
| 80–100 | Outstanding | O | 10 | Pass |
| 75–79 | Excellent | A | 9 | Pass |
| 70–74 | Very Good | B | 8 | Pass |
| 60–69 | Good | C | 7 | Pass |
| 50–59 | Fair | D | 6 | Pass |
| 45–49 | Average | E | 5 | Pass |
| 40–44 | Pass | P | 4 | Pass |
| 0–39 | Fail | F | 0 | Fail |

#### MU Preset Definition

```json
{
  "id": "mu_engineering",
  "name": "Mumbai University",
  "gradingSystem": "10-point CBCGS",
  "evaluationModel": "absolute",
  "gradeScale": [
    {"min": 80, "max": 100, "grade": "O", "points": 10, "pass": true},
    {"min": 75, "max": 79, "grade": "A", "points": 9, "pass": true},
    {"min": 70, "max": 74, "grade": "B", "points": 8, "pass": true},
    {"min": 60, "max": 69, "grade": "C", "points": 7, "pass": true},
    {"min": 50, "max": 59, "grade": "D", "points": 6, "pass": true},
    {"min": 45, "max": 49, "grade": "E", "points": 5, "pass": true},
    {"min": 40, "max": 44, "grade": "P", "points": 4, "pass": true},
    {"min": 0, "max": 39, "grade": "F", "points": 0, "pass": false}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "IF(SGPA < 7, 7.1*SGPA + 12, 7.4*SGPA + 12)",
  "cgpaToPercentage": "IF(CGPA < 7, 7.1*CGPA + 12, 7.4*CGPA + 12)",
  "creditStructure": {
    "totalCreditsRequired": 160,
    "semesterWiseCredits": "Typically 20-24 credits per semester"
  },
  "passRules": {
    "minInternalMarks": 40,
    "minExternalMarks": 40,
    "minOverallMarks": 40,
    "independentPassing": true
  },
  "backlogPolicy": {
    "atktRules": "Failure in >4 subjects results in year detention (year drop)",
    "carryForwardRules": "Internal marks can be carried forward if only external exam is failed",
    "maxAttempts": "Subject to syllabus validity period"
  },
  "assessmentScheme": {
    "components": ["Internal Assessment (IA)", "Semester-End Examination (SEE)"],
    "split": "40/60 for theory components",
    "theoryPracticalSeparation": true
  },
  "metadata": {
    "type": "State University",
    "erpSystem": "MU Digital Portal",
    "academicRegulationYear": "2016-17 onward (Choice Based)"
  },
  "specialFeatures": [
    "Piecewise conversion formula for percentage",
    "Independent heads of passing for IA and SEE",
    "Arrears limit of 4 backlogs per year"
  ]
}
```

---

### 1.3 COEP Technological University

COEP implements a highly rigorous, statistics-based relative grading system, operating as a unitary public university. The academic engine must be programmed to calculate cohort statistics—specifically the mean ($\mu$), median ($M$), and standard deviation ($\sigma$)—to generate dynamic grade thresholds rather than relying on static mark bins.

Crucially, COEP injects an absolute Lower Bound (LB) protection mechanism against severe statistical outliers to ensure academic rigor is not compromised by a cohort's collective poor performance. The simulation engine must implement the following algorithmic constraints to calculate the passing floor:

*   If the class $Median \le 30$, the absolute floor is clamped at $LB = 30$.
*   If $30 < Median/2 \le 40$, the floor is calculated as $LB = Median/2$.
*   If $Median/2 > 40$, the floor is capped at $LB = 40$.

The conversion to a notional percentage follows $Percentage = (CGPA - 0.5) \times 10$, supplanting an older legacy multiplier of $CGPA \times 9.55$. Degree progression relies on a minimum CGPA of 5.0 to be awarded the graduation certificate; students falling below this index face a mandatory CGPA improvement scheme allowing them to retake three courses.

#### COEP Grading Scale

| Relative Cutoff Condition | Grade Description | Grade Letter | Grade Points | Status |
| :---: | :---: | :---: | :---: | :---: |
| Dynamic Top Tier | Outstanding | O | 10 | Pass |
| Dynamic 2nd Tier | Excellent | A+ | 9 | Pass |
| Dynamic 3rd Tier | Very Good | A | 8 | Pass |
| Dynamic 4th Tier | Good | B+ | 7 | Pass |
| Dynamic 5th Tier | Above Average | B | 6 | Pass |
| Dynamic 6th Tier | Average | C | 5 | Pass |
| Marks $\ge$ LB | Pass | P | 4 | Pass |
| Marks $<$ LB | Fail | F | 0 | Fail |

#### COEP Preset Definition

```json
{
  "id": "coep",
  "name": "COEP Technological University",
  "gradingSystem": "10-point Relative",
  "evaluationModel": "statistical_relative_hybrid",
  "gradeScale": [
    {"grade": "O", "points": 10, "pass": true, "description": "Outstanding"},
    {"grade": "A+", "points": 9, "pass": true, "description": "Excellent"},
    {"grade": "A", "points": 8, "pass": true, "description": "Very Good"},
    {"grade": "B+", "points": 7, "pass": true, "description": "Good"},
    {"grade": "B", "points": 6, "pass": true, "description": "Above Average"},
    {"grade": "C", "points": 5, "pass": true, "description": "Average"},
    {"grade": "P", "points": 4, "pass": true, "description": "Pass"},
    {"grade": "F", "points": 0, "pass": false, "description": "Fail"}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "(SGPA - 0.5) * 10",
  "cgpaToPercentage": "(CGPA - 0.5) * 10",
  "creditStructure": {
    "minSemesterCredits": 16,
    "maxSemesterCredits": 28,
    "totalCreditsRequired": 166,
    "liberalLearning": "Mandatory integration of Humanities and Social Sciences"
  },
  "passRules": {
    "minDegreeCGPA": 5.0,
    "minPassingFloor": "Dynamic based on Median logic (LB=30, Median/2, or 40)",
    "probationRules": "CGPA improvement scheme triggered if final CGPA < 5.0"
  },
  "backlogPolicy": {
    "courseDrop": "Allowed mid-semester without Grade Card mention subject to 16-credit minimum",
    "retakeRules": "Supplementary Semesters available during summer",
    "replacementPolicy": "Best-of policy applied during improvement attempts"
  },
  "assessmentScheme": {
    "components": ["Continuous Evaluation (T1/T2)", "Mid-Semester Examination", "End-Semester Examination"],
    "split": "Continuous evaluation format",
    "vivaWeightage": "Integrated into specific liberal learning and lab modules"
  },
  "metadata": {
    "type": "Unitary Public University",
    "erpSystem": "MIS",
    "academicRegulationYear": "2022 Curriculum Revision"
  },
  "specialFeatures": [
    "Statistics-based relative grading system",
    "Dynamic Lower Bound passing floor protection",
    "CGPA improvement scheme allows retaking courses"
  ]
}
```

---

### 1.4 Pimpri Chinchwad College of Engineering (PCCOE)

Operating as an autonomous institute under the broader SPPU umbrella, PCCOE diverges slightly in its grade classifications and academic rigidities while retaining a foundational 10-point absolute grading scale. For prediction modules and placement analytics, the engine must statefully track graduation classification brackets distinctly.

PCCOE assigns degree honors based strictly on absolute CGPA thresholds:

*   **First Class with Distinction** is awarded for $CGPA \ge 7.75$.
*   **First Class** for $6.75 \le CGPA < 7.75$.
*   **Higher Second Class** for $6.25 \le CGPA < 6.75$.
*   **Second Class** for $5.50 \le CGPA < 6.25$.
*   A base **Pass Class** requires $CGPA \ge 4.0$.

This requires the abstraction layer to output string classifications appended to the numeric GPA generation.

#### PCCOE Grading Scale

| Marks Range | Grade Letter | Grade Points | Status |
| :---: | :---: | :---: | :---: |
| 80–100 | O | 10 | Pass |
| 70–79 | A+ | 9 | Pass |
| 60–69 | A | 8 | Pass |
| 55–59 | B+ | 7 | Pass |
| 50–54 | B | 6 | Pass |
| 45–49 | C | 5 | Pass |
| 40–44 | P | 4 | Pass |
| 0–39 | F | 0 | Fail |

#### PCCOE Preset Definition

```json
{
  "id": "pccoe",
  "name": "Pimpri Chinchwad College of Engineering",
  "gradingSystem": "10-point Autonomous",
  "evaluationModel": "absolute",
  "gradeScale": [
    {"min": 80, "max": 100, "grade": "O", "points": 10, "pass": true},
    {"min": 70, "max": 79, "grade": "A+", "points": 9, "pass": true},
    {"min": 60, "max": 69, "grade": "A", "points": 8, "pass": true},
    {"min": 55, "max": 59, "grade": "B+", "points": 7, "pass": true},
    {"min": 50, "max": 54, "grade": "B", "points": 6, "pass": true},
    {"min": 45, "max": 49, "grade": "C", "points": 5, "pass": true},
    {"min": 40, "max": 44, "grade": "P", "points": 4, "pass": true},
    {"min": 0, "max": 39, "grade": "F", "points": 0, "pass": false}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "(SGPA - 0.75) * 10",
  "cgpaToPercentage": "(CGPA - 0.75) * 10",
  "creditStructure": {
    "totalCreditsRequired": "Dynamic per NEP-2020 alignments",
    "workingProfessionalCredits": "Special reduced load structures for B.Tech WP programs"
  },
  "passRules": {
    "minGraduationCGPA": 4.0,
    "distinctionClassification": "CGPA >= 7.75",
    "firstClassClassification": "6.75 <= CGPA < 7.75"
  },
  "backlogPolicy": {
    "atktRules": "Standard SPPU ATKT norms apply for year-to-year progression"
  },
  "assessmentScheme": {
    "components": ["Continuous Internal Evaluation (CIE)", "End Semester Examination (ESE)"],
    "split": "Defined per course type (Theory vs Practical)",
    "theoryPracticalSeparation": true
  },
  "metadata": {
    "type": "Autonomous (Affiliated to SPPU)",
    "academicRegulationYear": "V2.3 / NEP-2020 Compliant"
  },
  "specialFeatures": [
    "Graduation honors classification brackets",
    "Special reduced credit load for working professionals",
    "Autonomous absolute scale under SPPU umbrella"
  ]
}
```

---

### 1.5 Vishwakarma Institute of Technology (VIT Pune)

VIT Pune utilizes a distinctive double-letter grade system to format its performance indices (Semester Performance Index - SPI, and Cumulative Performance Index - CPI). The grades follow a descending paired format: AA (10), AB (9), BB (8), BC (7), CC (6), CD (5), DD (4), and FF (0). This unique lexicographical format requires the preset engine to override standard single-letter visual abstractions.

The academic progression model includes a Summer Term explicitly conducted for First-Year and Final-Year students carrying FF (Fail), XX (Detained due to attendance), or II (Incomplete) grades to rapidly clear backlogs without disrupting the subsequent academic calendar. The assessment logic is heavily decentralized, utilizing an "exam on demand" mechanism and rapid evaluation turnaround guaranteeing results within 15 days.

#### VIT Pune Grading Scale

| Grade Letter | Description | Grade Points | Status |
| :---: | :---: | :---: | :---: |
| AA | Excellent | 10 | Pass |
| AB | Very Good | 9 | Pass |
| BB | Good | 8 | Pass |
| BC | Fair | 7 | Pass |
| CC | Above Average | 6 | Pass |
| CD | Average | 5 | Pass |
| DD | Marginal Pass | 4 | Pass |
| FF | Fail | 0 | Fail |
| XX | Detained | 0 | Fail |

#### VIT Pune Preset Definition

```json
{
  "id": "vit_pune",
  "name": "Vishwakarma Institute of Technology Pune",
  "gradingSystem": "Double-Letter 10-point",
  "evaluationModel": "absolute",
  "gradeScale": [
    {"grade": "AA", "points": 10, "pass": true, "description": "Excellent"},
    {"grade": "AB", "points": 9, "pass": true, "description": "Very Good"},
    {"grade": "BB", "points": 8, "pass": true, "description": "Good"},
    {"grade": "BC", "points": 7, "pass": true, "description": "Fair"},
    {"grade": "CC", "points": 6, "pass": true, "description": "Above Average"},
    {"grade": "CD", "points": 5, "pass": true, "description": "Average"},
    {"grade": "DD", "points": 4, "pass": true, "description": "Marginal Pass"},
    {"grade": "FF", "points": 0, "pass": false, "description": "Fail"},
    {"grade": "XX", "points": 0, "pass": false, "description": "Detained"}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "varies_by_admission_year",
  "cgpaToPercentage": "varies_by_admission_year",
  "creditStructure": {
    "auditCourses": "General Proficiency Courses required for holistic development",
    "internshipCredits": "Mandatory industry internship integration"
  },
  "passRules": {
    "attendance": 75,
    "minOverallMarks": 40
  },
  "backlogPolicy": {
    "summerTerm": "Conducted specifically for FY/Final year students with FF/XX/II grades",
    "reRegistration": "Allowed for backlog clearing with fee penalty"
  },
  "assessmentScheme": {
    "components": ["In-Semester Assessment", "Mid-Semester Assessment", "End-Semester Assessment"],
    "split": "Varies dynamically based on course instructor parameters"
  },
  "metadata": {
    "type": "Autonomous (Affiliated to SPPU)",
    "erpSystem": "VIERP"
  },
  "specialFeatures": [
    "Double-letter grading scale notation",
    "Summer Term conducted for backlog clearing",
    "Decentralized exam-on-demand mechanism with rapid results"
  ]
}
```

---

### 1.6 MIT World Peace University (MIT-WPU)

MIT-WPU operates as a private university and actively deviates from the standard SPPU absolute scale by adjusting its mark mapping to increase top-tier rigor. Specifically, achieving an 'O' (Outstanding) grade requires scoring between 90–100 marks (unlike SPPU's forgiving 80-100 bracket), while an 'A+' maps to the 70-89 range.

The ATKT logic implemented by MIT-WPU relies on a strict dual-condition pivot: a student must earn a CGPA $\ge 5$ OR successfully complete 50% of their total credits to secure admission to the next academic year. Failure to meet either condition results in a "Year Down" status. The internal passing requirement demands a minimum of 40% in internal continuous assessments and 40% in the Term End Examination independently, disabling aggregate passing.

#### MIT-WPU Grading Scale

| Marks Range | Grade Letter | Grade Points | Status |
| :---: | :---: | :---: | :---: |
| 90–100 | O | 10 | Pass |
| 70–89 | A+ | 9 | Pass |
| 60–69 | A | 8 | Pass |
| 55–59 | B+ | 7 | Pass |
| 50–54 | B | 6 | Pass |
| 45–49 | C | 5 | Pass |
| 40–44 | P | 4 | Pass |
| 0–39 | F | 0 | Fail |

#### MIT-WPU Preset Definition

```json
{
  "id": "mit_wpu",
  "name": "MIT World Peace University",
  "gradingSystem": "10-point CBCS Custom",
  "evaluationModel": "absolute",
  "gradeScale": [
    {"min": 90, "max": 100, "grade": "O", "points": 10, "pass": true},
    {"min": 70, "max": 89, "grade": "A+", "points": 9, "pass": true},
    {"min": 60, "max": 69, "grade": "A", "points": 8, "pass": true},
    {"min": 55, "max": 59, "grade": "B+", "points": 7, "pass": true},
    {"min": 50, "max": 54, "grade": "B", "points": 6, "pass": true},
    {"min": 45, "max": 49, "grade": "C", "points": 5, "pass": true},
    {"min": 40, "max": 44, "grade": "P", "points": 4, "pass": true},
    {"min": 0, "max": 39, "grade": "F", "points": 0, "pass": false}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "(SGPA - 0.75) * 10",
  "cgpaToPercentage": "(CGPA - 0.75) * 10",
  "creditStructure": {
    "totalCreditsRequired": "Per specific B.Tech/BBA curriculum",
    "peaceStudies": "Mandatory credit integration for Peace Studies and Yoga"
  },
  "passRules": {
    "minInternalMarks": 40,
    "minExternalMarks": 40,
    "attendance": 75,
    "independentPassing": true
  },
  "backlogPolicy": {
    "atktRules": "CGPA >= 5 OR 50% credits cleared",
    "detention": "Year down if ATKT conditions are strictly unmet"
  },
  "assessmentScheme": {
    "components": ["Formative Assessment (FAT)", "Mid-Term Examination", "Summative Term End Examination"],
    "split": "15% FAT / 30% Mid-Term / 55% Summative"
  },
  "metadata": {
    "type": "Private University",
    "academicRegulationYear": "2025-26 Manual"
  },
  "specialFeatures": [
    "Custom O grade starting floor at 90 marks",
    "Dual-condition year-down progression policy",
    "Mandatory credit integration for Peace Studies and Yoga"
  ]
}
```

---

### 1.7 D Y Patil International University (DYPIU)

DYPIU utilizes a 0-to-10 point absolute grading scheme deeply integrated with concurrent internal evaluations. A severe exam-barring mechanism is active within the engine logic: students must secure a 40% minimum in concurrent internal evaluation and practical assessments independently just to become eligible to sit for the End Term Theory Examination.

The academic warning and detention algorithms are particularly steep; scoring below a 4.5 CGPA immediately results in a semester-back condition, enforcing a high survival baseline for the institution. Conversion metrics are directly proportional, mapped as $Percentage = CGPA \times 10$.

#### DYPIU Grading Scale

| Marks Range | Grade Letter | Grade Points | Status |
| :---: | :---: | :---: | :---: |
| 90–100 | O | 10 | Pass |
| 80–89 | A+ | 9 | Pass |
| 70–79 | A | 8 | Pass |
| 60–69 | B+ | 7 | Pass |
| 50–59 | B | 6 | Pass |
| 45–49 | C | 5 | Pass |
| 40–44 | P | 4 | Pass |
| 0–39 | F | 0 | Fail |

#### DYPIU Preset Definition

```json
{
  "id": "dypiu",
  "name": "D Y Patil International University",
  "gradingSystem": "10-point Scheme",
  "evaluationModel": "absolute",
  "gradeScale": [
    {"min": 90, "max": 100, "grade": "O", "points": 10, "pass": true},
    {"min": 80, "max": 89, "grade": "A+", "points": 9, "pass": true},
    {"min": 70, "max": 79, "grade": "A", "points": 8, "pass": true},
    {"min": 60, "max": 69, "grade": "B+", "points": 7, "pass": true},
    {"min": 50, "max": 59, "grade": "B", "points": 6, "pass": true},
    {"min": 45, "max": 49, "grade": "C", "points": 5, "pass": true},
    {"min": 40, "max": 44, "grade": "P", "points": 4, "pass": true},
    {"min": 0, "max": 39, "grade": "F", "points": 0, "pass": false}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "SGPA * 10",
  "cgpaToPercentage": "CGPA * 10",
  "creditStructure": {
    "totalCreditsRequired": "Varies by branch (CSE, Bioengineering, etc.)"
  },
  "passRules": {
    "minConcurrentEval": 40,
    "minPracticalEval": 40,
    "minCGPAForProgression": 4.5,
    "attendance": 75,
    "examEligibility": "Must pass concurrent evaluation to sit for End Term"
  },
  "backlogPolicy": {
    "detention": "Semester drop if CGPA falls below 4.5"
  },
  "assessmentScheme": {
    "components": ["Concurrent Evaluation", "Practical Assessment", "End Term Theory Examination"],
    "split": "Continuous formative evaluation"
  },
  "metadata": {
    "type": "Private University"
  },
  "specialFeatures": [
    "Severe internal evaluation minimum threshold required to be eligible for End Term exam",
    "Immediate semester drop if CGPA falls below 4.5"
  ]
}
```

---

### 1.8 Bharati Vidyapeeth Deemed University (BVDU)

BVDU adopts a 10-point absolute grading model defined by dynamic mathematical generation for specific grade point layers. An exceptional feature that the abstraction layer must execute is the algorithmic calculation of grade points within intermediate brackets: for marks falling between 55 and 79, the formula $Grade Point = Truncate(Marks / 10) + 2$ is utilized. For example, a score of 68 yields $Truncate(6.8) + 2 = 6 + 2 = 8$ grade points.

Furthermore, an independent head-of-passing logic ensures that if a student fails Internal Assessment (IA) but passes the University Examination (UE), they only repeat the IA segment, maintaining the passed UE score. However, an absolute minimum of 25% is required in IA alongside a minimum aggregate GPA of 6.0 in the specific course to pass the class overall.

#### BVDU Grading Scale

| Marks Range | Grade Letter | Grade Points | Status |
| :---: | :---: | :---: | :---: |
| 80–100 | O | 10 | Pass |
| 70–79 | A+ | 9 | Pass |
| 60–69 | A | 8 | Pass |
| 55–59 | B+ | 7 | Pass |
| 50–54 | B | 6 | Pass |
| 40–49 | C | 5 | Pass |
| 0–39 | D | 0 | Fail |

#### BVDU Preset Definition

```json
{
  "id": "bvdu",
  "name": "Bharati Vidyapeeth Deemed University",
  "gradingSystem": "10-point CBCS",
  "evaluationModel": "absolute_with_formulaic_points",
  "gradeScale": [
    {"min": 80, "max": 100, "grade": "O", "points": 10, "pass": true},
    {"min": 70, "max": 79, "grade": "A+", "points": 9, "pass": true},
    {"min": 60, "max": 69, "grade": "A", "points": 8, "pass": true},
    {"min": 55, "max": 59, "grade": "B+", "points": 7, "pass": true},
    {"min": 50, "max": 54, "grade": "B", "points": 6, "pass": true},
    {"min": 40, "max": 49, "grade": "C", "points": 5, "pass": true},
    {"min": 0, "max": 39, "grade": "D", "points": 0, "pass": false}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "varies_by_program_regulations",
  "cgpaToPercentage": "varies_by_program_regulations",
  "creditStructure": {
    "totalCreditsRequired": "Varies by specific B.Tech/MBA program"
  },
  "passRules": {
    "minInternalMarks": 25,
    "minCourseGPA": 6.0,
    "independentPassingHeads": true
  },
  "backlogPolicy": {
    "isolatedClearing": "Can clear failed IA or UE independently without retaking the passed counterpart"
  },
  "assessmentScheme": {
    "components": ["Internal Assessment (IA)", "University Examination (UE)"],
    "split": "Program dependent (often 40/60)"
  },
  "metadata": {
    "type": "Deemed-to-be University"
  },
  "specialFeatures": [
    "Mathematical formulaic grade points generation for 55-79 marks range",
    "Independent passing heads with isolated clearing segments"
  ]
}
```

---

### 1.9 JSPM Rajarshi Shahu College of Engineering (RSCOE)

JSPM RSCOE utilizes an autonomous absolute grading system characterized by a three-tier assessment structure. The 'O' grade floor is positioned stringently at 90 marks. Evaluation integrates In-Semester Evaluation (ISE), Mid-Semester Evaluation (MSE), and End-Semester Evaluation (ESE).

ATKT rules broadly adhere to SPPU baseline guidelines. To handle attendance algorithms, the simulation engine must account for a 25% exemption buffer in the 100% attendance mandate for medical or approved co-curricular events (leaving a hard 75% floor). When a student clears a backlog, the replacement policy explicitly allows the new grade to overwrite the old one in the cumulative CGPA calculation.

#### JSPM RSCOE Grading Scale

| Marks Range | Grade Letter | Grade Points | Status |
| :---: | :---: | :---: | :---: |
| 90–100 | O | 10 | Pass |
| 80–89 | A+ | 9 | Pass |
| 70–79 | A | 8 | Pass |
| 60–69 | B+ | 7 | Pass |
| 55–59 | B | 6 | Pass |
| 45–49 | C | 5 | Pass |
| 40–44 | P | 4 | Pass |
| 0–39 | F | 0 | Fail |

#### JSPM RSCOE Preset Definition

```json
{
  "id": "jspm_rscoe",
  "name": "JSPM Rajarshi Shahu College of Engineering",
  "gradingSystem": "10-point Autonomous",
  "evaluationModel": "absolute",
  "gradeScale": [
    {"min": 90, "max": 100, "grade": "O", "points": 10, "pass": true},
    {"min": 80, "max": 89, "grade": "A+", "points": 9, "pass": true},
    {"min": 70, "max": 79, "grade": "A", "points": 8, "pass": true},
    {"min": 60, "max": 69, "grade": "B+", "points": 7, "pass": true},
    {"min": 55, "max": 59, "grade": "B", "points": 6, "pass": true},
    {"min": 45, "max": 49, "grade": "C", "points": 5, "pass": true},
    {"min": 40, "max": 44, "grade": "P", "points": 4, "pass": true},
    {"min": 0, "max": 39, "grade": "F", "points": 0, "pass": false}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "varies_by_sppu_norms",
  "cgpaToPercentage": "varies_by_sppu_norms",
  "creditStructure": {
    "auditCourses": "Graded exclusively as PP (Pass) or NP (Not Pass)",
    "totalCreditsRequired": "Per specific branch curriculum"
  },
  "passRules": {
    "attendance": 75,
    "exemptionAllowance": "Up to 25% for medical/co-curricular"
  },
  "backlogPolicy": {
    "replacementPolicy": "New grade permanently replaces old in CGPA calculation upon retake"
  },
  "assessmentScheme": {
    "components": ["In-Semester Evaluation (ISE)", "Mid-Semester Evaluation (MSE)", "End-Semester Evaluation (ESE)"],
    "split": "Continuous tripartite split"
  },
  "metadata": {
    "type": "Autonomous (Affiliated to SPPU)"
  },
  "specialFeatures": [
    "Tripartite continuous assessment structure",
    "Attendance exemption allowance up to 25%",
    "Permanent replacement of old grade on successful retake"
  ]
}
```

---

## 2. National / Institutional Systems

### 2.1 Visvesvaraya Technological University (VTU)

VTU operates across Karnataka commanding a standard 10-point absolute scale. A crucial architectural constraint for the simulation engine is VTU's rigid cap on credit registration; students are barred from registering for more than 24 credits per semester, ensuring a normalized load of 18-24 credits. Percentage extraction requires the standard $(CGPA - 0.75) \times 10$ equation, universally recognized for the 2015, 2017, and 2018 schemes.

#### VTU Grading Scale

| Marks Range | Grade Letter | Grade Points | Status |
| :---: | :---: | :---: | :---: |
| 90–100 | O | 10 | Pass |
| 80–89 | A+ | 9 | Pass |
| 70–79 | A | 8 | Pass |
| 60–69 | B+ | 7 | Pass |
| 55–59 | B | 6 | Pass |
| 50–54 | C | 5 | Pass |
| 40–44 | P | 4 | Pass |
| 0–39 | F | 0 | Fail |

#### VTU Preset Definition

```json
{
  "id": "vtu",
  "name": "Visvesvaraya Technological University",
  "gradingSystem": "10-point CBCS",
  "evaluationModel": "absolute",
  "gradeScale": [
    {"min": 90, "max": 100, "grade": "O", "points": 10, "pass": true},
    {"min": 80, "max": 89, "grade": "A+", "points": 9, "pass": true},
    {"min": 70, "max": 79, "grade": "A", "points": 8, "pass": true},
    {"min": 60, "max": 69, "grade": "B+", "points": 7, "pass": true},
    {"min": 55, "max": 59, "grade": "B", "points": 6, "pass": true},
    {"min": 50, "max": 54, "grade": "C", "points": 5, "pass": true},
    {"min": 40, "max": 44, "grade": "P", "points": 4, "pass": true},
    {"min": 0, "max": 39, "grade": "F", "points": 0, "pass": false}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "(SGPA - 0.75) * 10",
  "cgpaToPercentage": "(CGPA - 0.75) * 10",
  "creditStructure": {
    "maxSemesterCredits": 24,
    "avgSemesterCredits": 18,
    "mandatoryNonCredit": "2 to 3 units per semester"
  },
  "passRules": {
    "progression": "ATKT limits strictly enforced based on active scheme"
  },
  "backlogPolicy": {
    "atktRules": "Varies by scheme iteration (2015 vs 2018 vs 2022)"
  },
  "assessmentScheme": {
    "components": ["Continuous Internal Evaluation (CIE)", "Semester End Examination (SEE)"],
    "split": "50/50"
  },
  "metadata": {
    "type": "State Technological University"
  },
  "specialFeatures": ["Hard cap on semester credit registration at 24"]
}
```

---

### 2.2 Anna University

Anna University relies on a multiplier-based conversion logic distinct from the minus-offset standards seen in Maharashtra and Karnataka. The engine calculates equivalent percentages purely via $Percentage = CGPA \times 10$. The arrears (backlog) policy limits students to carrying a restricted number of failed subjects (historically 3-5 depending on the specific semester and syllabus iteration) before progression is halted, commonly referred to as a "year drop" condition.

#### Anna University Grading Scale

| Marks Range | Grade Letter | Grade Points | Status |
| :---: | :---: | :---: | :---: |
| 90–100 | O | 10 | Pass |
| 80–89 | A+ | 9 | Pass |
| 70–79 | A | 8 | Pass |
| 60–69 | B+ | 7 | Pass |
| 55–59 | B | 6 | Pass |
| 50–54 | C | 5 | Pass |
| 0–49 | F | 0 | Fail |

#### Anna University Preset Definition

```json
{
  "id": "anna_university",
  "name": "Anna University",
  "gradingSystem": "10-point CBCS",
  "evaluationModel": "absolute",
  "gradeScale": [
    {"min": 90, "max": 100, "grade": "O", "points": 10, "pass": true},
    {"min": 80, "max": 89, "grade": "A+", "points": 9, "pass": true},
    {"min": 70, "max": 79, "grade": "A", "points": 8, "pass": true},
    {"min": 60, "max": 69, "grade": "B+", "points": 7, "pass": true},
    {"min": 55, "max": 59, "grade": "B", "points": 6, "pass": true},
    {"min": 50, "max": 54, "grade": "C", "points": 5, "pass": true},
    {"min": 0, "max": 49, "grade": "F", "points": 0, "pass": false}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "SGPA * 10",
  "cgpaToPercentage": "CGPA * 10",
  "creditStructure": {
    "totalCreditsRequired": "Per specific curriculum iteration"
  },
  "passRules": {
    "minMarks": 50
  },
  "backlogPolicy": {
    "maxArrears": "Regulated strictly per semester progression (typically 3-5 active arrears maximum)"
  },
  "assessmentScheme": {
    "components": ["Continuous Assessment (CA)", "End Semester Examination (ESE)"],
    "split": "50/50"
  },
  "metadata": {
    "type": "State University"
  },
  "specialFeatures": [
    "Standard multiplier-based percentage conversion (CGPA * 10)",
    "Strict restriction on active arrears limit before progression halt"
  ]
}
```

---

### 2.3 Jawaharlal Nehru Technological University, Hyderabad (JNTUH)

JNTUH adopts an intermediate conversion formula representing a mathematical center-point between standard evaluation systems. The simulation must apply $Percentage = (CGPA - 0.5) \times 10$, uniformly codified in their R16, R18, and R22 academic regulations.

#### JNTUH Grading Scale

| Marks Range | Grade Letter | Grade Points | Status |
| :---: | :---: | :---: | :---: |
| 90–100 | O | 10 | Pass |
| 80–89 | A+ | 9 | Pass |
| 70–79 | A | 8 | Pass |
| 60–69 | B+ | 7 | Pass |
| 50–59 | B | 6 | Pass |
| 40–49 | C | 5 | Pass |
| 0–39 | F | 0 | Fail |

#### JNTUH Preset Definition

```json
{
  "id": "jntuh",
  "name": "Jawaharlal Nehru Technological University, Hyderabad",
  "gradingSystem": "10-point Scale",
  "evaluationModel": "absolute",
  "gradeScale": [
    {"min": 90, "max": 100, "grade": "O", "points": 10, "pass": true},
    {"min": 80, "max": 89, "grade": "A+", "points": 9, "pass": true},
    {"min": 70, "max": 79, "grade": "A", "points": 8, "pass": true},
    {"min": 60, "max": 69, "grade": "B+", "points": 7, "pass": true},
    {"min": 50, "max": 59, "grade": "B", "points": 6, "pass": true},
    {"min": 40, "max": 49, "grade": "C", "points": 5, "pass": true},
    {"min": 0, "max": 39, "grade": "F", "points": 0, "pass": false}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "(SGPA - 0.5) * 10",
  "cgpaToPercentage": "(CGPA - 0.5) * 10",
  "creditStructure": {
    "totalCreditsRequired": "Per respective R-scheme curriculum"
  },
  "passRules": {
    "minMarks": 40
  },
  "backlogPolicy": {
    "atktRules": "Regulated credit progression limits"
  },
  "assessmentScheme": {
    "components": ["Internal Evaluation", "External Examination"],
    "split": "30/70"
  },
  "metadata": {
    "type": "State Technological University"
  },
  "specialFeatures": ["Unique minus 0.5 conversion offset"]
}
```

---

### 2.4 SRM Institute of Science and Technology (SRM IST)

SRM IST utilizes a fractional conversion algorithm, rendering percentage as $Percentage = CGPA \times 9.5$. The 10-point scale translates grades from 'O' to 'F' as absolute markers of success. The engine must enforce a rigorous floor; to clear a course, a student requires greater than 50% overall. Both 'F' (Fail) and 'Ab' (Absent) grades severely impact the GPA denominator, yielding 0 grade points.

#### SRM IST Grading Scale

| Marks Range | Grade Letter | Grade Points | Status |
| :---: | :---: | :---: | :---: |
| 91–100 | O | 10 | Pass |
| 81–90 | A+ | 9 | Pass |
| 71–80 | A | 8 | Pass |
| 61–70 | B+ | 7 | Pass |
| 56–60 | B | 6 | Pass |
| 50–55 | C | 5 | Pass |
| < 50 | F | 0 | Fail |

#### SRM IST Preset Definition

```json
{
  "id": "srm_ist",
  "name": "SRM Institute of Science and Technology",
  "gradingSystem": "10-point Scale",
  "evaluationModel": "absolute",
  "gradeScale": [
    {"min": 91, "max": 100, "grade": "O", "points": 10, "pass": true},
    {"min": 81, "max": 90, "grade": "A+", "points": 9, "pass": true},
    {"min": 71, "max": 80, "grade": "A", "points": 8, "pass": true},
    {"min": 61, "max": 70, "grade": "B+", "points": 7, "pass": true},
    {"min": 56, "max": 60, "grade": "B", "points": 6, "pass": true},
    {"min": 50, "max": 55, "grade": "C", "points": 5, "pass": true},
    {"min": 0, "max": 49, "grade": "F", "points": 0, "pass": false}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "SGPA * 9.5",
  "cgpaToPercentage": "CGPA * 9.5",
  "creditStructure": {
    "totalCreditsRequired": "Varies by specific B.Tech branch"
  },
  "passRules": {
    "minOverallMarks": 50
  },
  "backlogPolicy": {
    "retakeRules": "Arrears examinations available in subsequent semesters"
  },
  "assessmentScheme": {
    "components": ["Continuous Internal Evaluation (CIE)", "Semester End Examination (SEE)"],
    "split": "50/50"
  },
  "metadata": {
    "type": "Deemed-to-be University"
  },
  "specialFeatures": [
    "SRM unique fractional multiplier percentage conversion (CGPA * 9.5)",
    "Fail (F) and Absent (Ab) grades yield 0 grade points and affect denominator"
  ]
}
```

---

### 2.5 VIT Vellore

VIT Vellore operates a sophisticated class-wise Relative Grading System triggered explicitly when a course's registration strength exceeds 10 students; below this threshold, the engine must automatically revert to absolute grading pathways.

The relative grading algorithm computes the Mean ($\mu$) and Standard Deviation ($\sigma$) of the cohort. The highest achievable grade ('S') possesses a dual-condition mathematical floor ensuring base competency is met alongside relative superiority: the score must be $> \mu + 1.5\sigma$ AND $\ge 90\%$ of total marks. Furthermore, if a student fails the embedded laboratory component (requiring a 50% average), they are penalized with an 'N' grade for the entire course, marking it as "not completed" regardless of theory performance.

#### VIT Vellore Grading Scale

| Relative Condition | Grade Letter | Grade Points |
| :---: | :---: | :---: |
| $> (\mu + 1.5\sigma)$ AND $\ge 90\%$ | S | 10 |
| $> (\mu + 0.5\sigma)$ to $\le (\mu + 1.5\sigma)$ | A | 9 |
| $> (\mu - 0.5\sigma)$ to $\le (\mu + 0.5\sigma)$ | B | 8 |
| $> (\mu - 1.0\sigma)$ to $\le (\mu - 0.5\sigma)$ | C | 7 |
| $> (\mu - 1.5\sigma)$ to $\le (\mu - 1.0\sigma)$ | D | 6 |
| $> (\mu - 2.0\sigma)$ to $\le (\mu - 1.5\sigma)$ | E | 5 |
| $\le (\mu - 2.0\sigma)$ | F | 0 |

#### VIT Vellore Preset Definition

```json
{
  "id": "vit_vellore",
  "name": "VIT Vellore",
  "gradingSystem": "10-point Relative",
  "evaluationModel": "conditional_relative",
  "gradeScale": [
    {"grade": "S", "points": 10, "pass": true, "description": "Outstanding"},
    {"grade": "A", "points": 9, "pass": true, "description": "Excellent"},
    {"grade": "B", "points": 8, "pass": true, "description": "Very Good"},
    {"grade": "C", "points": 7, "pass": true, "description": "Good"},
    {"grade": "D", "points": 6, "pass": true, "description": "Above Average"},
    {"grade": "E", "points": 5, "pass": true, "description": "Pass"},
    {"grade": "F", "points": 0, "pass": false, "description": "Fail"}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "varies_by_transcript_request",
  "cgpaToPercentage": "varies_by_transcript_request",
  "creditStructure": {
    "totalCreditsRequired": "Dynamic via Fully Flexible Credit System (FFCS)"
  },
  "passRules": {
    "minLabMarks": 50,
    "minClassStrengthForRelative": 10
  },
  "backlogPolicy": {
    "labFailPenalty": "Failure in lab fails entire embedded course ('N' grade)"
  },
  "assessmentScheme": {
    "components": ["Continuous Assessment (CAT)", "Laboratory Evaluations", "Term End Examinations (TEE)"],
    "split": "Varies by course type (Project Based Learning vs Research Based Learning)"
  },
  "metadata": {
    "type": "Deemed-to-be University"
  },
  "specialFeatures": [
    "Fully Flexible Credit System (FFCS)",
    "Relative grading triggered conditionally on class size (strength > 10)",
    "Lab failure results in automatic fail of the entire embedded course"
  ]
}
```

---

### 2.6 MIT Manipal

MIT Manipal follows a strictly regulated relative grading system where letter grades map to binomial distribution fittings surrounding the standard deviation. 'A+' typically correlates to $\mu + 2\sigma$ or $\mu + 1.5\sigma$, tracking downward.

The simulation engine must track a severe academic penalty regarding backlogs: students who fail (receive an F grade) and subsequently re-register for the course are subjected to a hard ceiling, with the maximum achievable grade on the repeated attempt capped at a 'C', regardless of their absolute or relative score. Percentage conversion is fixed mathematically at $Percentage = CGPA \times 10$.

#### MIT Manipal Preset Definition

```json
{
  "id": "mit_manipal",
  "name": "MIT Manipal",
  "gradingSystem": "10-point Relative",
  "evaluationModel": "relative",
  "gradeScale": [
    {"grade": "A+", "points": 10, "pass": true, "description": "Outstanding"},
    {"grade": "A", "points": 9, "pass": true, "description": "Excellent"},
    {"grade": "B", "points": 8, "pass": true, "description": "Very Good"},
    {"grade": "C", "points": 7, "pass": true, "description": "Good"},
    {"grade": "D", "points": 6, "pass": true, "description": "Above Average"},
    {"grade": "E", "points": 5, "pass": true, "description": "Pass"},
    {"grade": "F", "points": 0, "pass": false, "description": "Fail"}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "SGPA * 10",
  "cgpaToPercentage": "CGPA * 10",
  "creditStructure": {
    "totalCreditsRequired": "Varies by specific engineering program"
  },
  "passRules": {
    "progression": "Standard prerequisite clearance required"
  },
  "backlogPolicy": {
    "retakePenalty": "Maximum attainable grade capped permanently at 'C' upon re-registration after an 'F'"
  },
  "assessmentScheme": {
    "components": ["In-Semester Assessment", "End-Semester Examination"],
    "split": "Continuous format"
  },
  "metadata": {
    "type": "Deemed-to-be University"
  },
  "specialFeatures": [
    "Relative Z-score grading system with binomial distribution fitting",
    "Severe backlog penalty: retake attempts capped permanently at 'C' grade"
  ]
}
```

---

### 2.7 BITS Pilani

BITS Pilani requires a highly custom preset due to its histogram-based continuous relative grading framework and unit-based credit system. Instead of rigidly forcing grades into a bell curve, instructors plot marks in descending order to identify natural performance clusters (gaps in the score distribution), which dictate the dividing lines between letter grades.

A highly unique algorithmic requirement for the simulation engine is the non-linear grade point scale. While standard 10-point systems descend by a factor of 1, BITS utilizes A(10), A-(9), B(8), B-(7), C(6), C-(5), D(4), and subsequently drops directly to E(2) for marginal performance. A strict academic survival floor is enforced: students require a minimum CGPA of 4.50 to clear the B.Tech program. Failure yields a Not Cleared (NC) or Required to Register Again (RRA) marker.

#### BITS Pilani Grading Scale

| Grade Letter | Grade Points |
| :---: | :---: |
| A | 10 |
| A- | 9 |
| B | 8 |
| B- | 7 |
| C | 6 |
| C- | 5 |
| D | 4 |
| E | 2 |
| NC | 0 |

#### BITS Pilani Preset Definition

```json
{
  "id": "bits_pilani",
  "name": "BITS Pilani",
  "gradingSystem": "10-point Relative (Unit-based)",
  "evaluationModel": "histogram_clustering",
  "gradeScale": [
    {"grade": "A", "points": 10, "pass": true, "description": "Excellent"},
    {"grade": "A-", "points": 9, "pass": true, "description": "Very Good"},
    {"grade": "B", "points": 8, "pass": true, "description": "Good"},
    {"grade": "B-", "points": 7, "pass": true, "description": "Above Average"},
    {"grade": "C", "points": 6, "pass": true, "description": "Average"},
    {"grade": "C-", "points": 5, "pass": true, "description": "Below Average"},
    {"grade": "D", "points": 4, "pass": true, "description": "Pass"},
    {"grade": "E", "points": 2, "pass": true, "description": "Marginal Pass"},
    {"grade": "NC", "points": 0, "pass": false, "description": "Not Cleared"}
  ],
  "sgpaFormula": "SUM(CourseUnits * GradePoints) / SUM(CourseUnits)",
  "cgpaFormula": "SUM(TotalUnitsPoints) / SUM(TotalUnitsEarned)",
  "sgpaToPercentage": "SGPA * 10",
  "cgpaToPercentage": "CGPA * 10",
  "creditStructure": {
    "unitSystem": "Operates on 'Units' rather than 'Credits'",
    "thesisUnits": "9-25 units dynamically split across semesters"
  },
  "passRules": {
    "minGraduationCGPA": 4.5,
    "probationRules": "Academic Monitoring Board (AMB) intervention if requirements are unmet"
  },
  "backlogPolicy": {
    "ncRule": "Not Cleared (NC) mandates course repetition without grade card erasure"
  },
  "assessmentScheme": {
    "components": ["Test-1", "Test-2", "Quizzes/Assignments", "Comprehensive Examination"],
    "split": "Continuous and highly customizable by the Instructor-in-Charge"
  },
  "metadata": {
    "type": "Deemed-to-be University (INI equivalent)"
  },
  "specialFeatures": [
    "Operates on a unit-based credit system rather than credits",
    "Histogram-based continuous relative clustering without rigid curves",
    "Non-linear grade point scale skipping grade point 3 entirely"
  ]
}
```

---

### 2.8 Delhi Technological University (DTU)

DTU’s relative grading logic is engineered with rigid boundary conditions overlaying the statistical model, designed to curb extreme grade inflation or deflation. The engine must enforce a "Whichever is lower" algorithm: the cutoff for a given grade is either the statistical relative computation or an absolute percentage floor, taking the lesser of the two.

For instance, the cutoff for 'O' (Outstanding) is calculated as $Marks \ge \mu + 1.5\sigma$ OR $91\%$. The 'A+' cutoff is $Marks \ge \mu + 1.0\sigma$ OR $82\%$. Conversion is mathematically mapped directly as $Percentage = CGPA \times 10$.

#### DTU Preset Definition

```json
{
  "id": "dtu",
  "name": "Delhi Technological University",
  "gradingSystem": "10-point Relative",
  "evaluationModel": "relative_with_absolute_caps",
  "gradeScale": [
    {"grade": "O", "points": 10, "pass": true, "description": "Outstanding"},
    {"grade": "A+", "points": 9, "pass": true, "description": "Excellent"},
    {"grade": "A", "points": 8, "pass": true, "description": "Very Good"},
    {"grade": "B+", "points": 7, "pass": true, "description": "Good"},
    {"grade": "B", "points": 6, "pass": true, "description": "Above Average"},
    {"grade": "C", "points": 5, "pass": true, "description": "Average"},
    {"grade": "P", "points": 4, "pass": true, "description": "Pass"},
    {"grade": "F", "points": 0, "pass": false, "description": "Fail"}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "SGPA * 10",
  "cgpaToPercentage": "CGPA * 10",
  "creditStructure": {
    "minSemesterCredits": 16,
    "maxSemesterCredits": 32,
    "totalCreditsRequired": "Varies by specific B.Tech program"
  },
  "passRules": {
    "minPassingFloor": "Mean - 1.5 sigma OR 37% (whichever is lower)"
  },
  "backlogPolicy": {
    "retakeRules": "Subject to semester offering and credit limits"
  },
  "assessmentScheme": {
    "components": ["Mid-Term Examination (MTE)", "Class Work Assessment (CWS)", "End-Term Examination (ETE)"],
    "split": "Heavily defined by course structure (e.g., 25% MTE / 25% CWS / 50% ETE)"
  },
  "metadata": {
    "type": "State University"
  },
  "specialFeatures": [
    "Relative grading with absolute percentage caps",
    "Whichever-is-lower boundary algorithm checks statistical vs absolute cutoffs"
  ]
}
```

---

### 2.9 Netaji Subhas University of Technology (NSUT)

NSUT utilizes a highly specific piecewise relative formula dividing the statistical curve into six distinct computational bandwidths via a generated factor $d$. The abstraction layer must execute a multi-step calculation. First, it calculates an Upper Limit ($OL$) and Lower Limit ($DL$) based on $\mu + 1.5\sigma$ and $\mu - 1.5\sigma$, constrained by hard absolute boundaries: $OL$ is capped at 95 (or floored at 84.99), and $DL$ is capped at 40 (or floored at 29.99).

The bandwidth delta is then calculated as $d = (OL - DL) / 6$. Grades are subsequently layered in intervals of $d$ (e.g., the 'C' grade boundary corresponds to $(DL + d) < marks \le (DL + 2d)$). Like DTU, the overall percentage translates via $Percentage = CGPA \times 10$.

#### NSUT Preset Definition

```json
{
  "id": "nsut",
  "name": "Netaji Subhas University of Technology",
  "gradingSystem": "10-point Relative",
  "evaluationModel": "banded_relative",
  "gradeScale": [
    {"grade": "O", "points": 10, "pass": true, "description": "Outstanding"},
    {"grade": "A+", "points": 9, "pass": true, "description": "Excellent"},
    {"grade": "A", "points": 8, "pass": true, "description": "Very Good"},
    {"grade": "B+", "points": 7, "pass": true, "description": "Good"},
    {"grade": "B", "points": 6, "pass": true, "description": "Above Average"},
    {"grade": "C", "points": 5, "pass": true, "description": "Average"},
    {"grade": "P", "points": 4, "pass": true, "description": "Pass"},
    {"grade": "F", "points": 0, "pass": false, "description": "Fail"}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "SGPA * 10",
  "cgpaToPercentage": "CGPA * 10",
  "creditStructure": {
    "totalCreditsRequired": "Per specific branch curriculum"
  },
  "passRules": {
    "minPassingLogic": "Marks > DL (Dynamic lower limit calculated via SD boundaries)"
  },
  "backlogPolicy": {
    "retakeRules": "Standard relative rules re-applied to repeaters in subsequent cohorts"
  },
  "assessmentScheme": {
    "components": ["Continuous Evaluation", "Mid-Semester Examination", "End-Semester Examination"],
    "split": "Continuous evaluation"
  },
  "metadata": {
    "type": "State University",
    "academicRegulationYear": "2019-20 onward"
  },
  "specialFeatures": [
    "Piecewise relative formula dividing statistical curve into 6 discrete bands",
    "Capped upper and lower dynamic limits with strict absolute boundaries"
  ]
}
```

---

### 2.10 NIT Council / NIT System

While exact parameters vary minutely across the 31 individual National Institutes of Technology (NITs), the overarching framework codified by the NIT Council frequently employs a 10-point scale mapped against a 7-grade system, creating a hybrid absolute/relative evaluation layer. For instance, models such as NIT Warangal employ grades descending from S (10 points) down to U (3 points, denoting failure). The standard absolute mappings equate to 90-100 (S), 80-89 (A), 70-79 (B), 60-69 (C), 50-59 (D), 40-49 (P), and 0-39 (U).

To achieve a First Division classification at graduation, students require a minimum CGPA of 6.50. A 10-point standard mapping ($Percentage = CGPA \times 10$) is universally leveraged for translation. Re-evaluations (REX) cap the maximum attainable grade severely, often at the lowest passing tier (E or P).

#### NIT Council Preset Definition

```json
{
  "id": "nit_system_generic",
  "name": "NIT Council Model",
  "gradingSystem": "7-point/10-point System",
  "evaluationModel": "absolute_relative_hybrid",
  "gradeScale": [
    {"min": 90, "max": 100, "grade": "S", "points": 10, "pass": true, "description": "Outstanding"},
    {"min": 80, "max": 89, "grade": "A", "points": 9, "pass": true, "description": "Excellent"},
    {"min": 70, "max": 79, "grade": "B", "points": 8, "pass": true, "description": "Very Good"},
    {"min": 60, "max": 69, "grade": "C", "points": 7, "pass": true, "description": "Good"},
    {"min": 50, "max": 59, "grade": "D", "points": 6, "pass": true, "description": "Above Average"},
    {"min": 40, "max": 49, "grade": "P", "points": 5, "pass": true, "description": "Pass"},
    {"min": 0, "max": 39, "grade": "U", "points": 0, "pass": false, "description": "Fail"}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "SGPA * 10",
  "cgpaToPercentage": "CGPA * 10",
  "creditStructure": {
    "totalCreditsRequired": "Varies by respective NIT, generally 160-180"
  },
  "passRules": {
    "minOverallMarks": 40,
    "firstDivisionCGPA": 6.5
  },
  "backlogPolicy": {
    "reExamination": "REX maximum grade strictly capped at E (or base pass limit)"
  },
  "assessmentScheme": {
    "components": ["Continuous Assessment", "Mid-term Examination", "End-term Examination"],
    "split": "Typically 20/30/50"
  },
  "metadata": {
    "type": "Institute of National Importance"
  },
  "specialFeatures": [
    "Hybrid absolute-relative evaluation layers",
    "Re-evaluation grade capped at base passing tier (E or P)"
  ]
}
```

---

## 3. Custom / Legacy Systems

For universal backward compatibility and international transcript normalization, the simulation engine incorporates custom baseline schemas designed to act as fallbacks or comparative layers.

### 3.1 US / Global 4-Point GPA System

The 4.0 scale represents the foundational architecture for North American academic evaluation and global credentialing. The engine computes this without an SGPA multiplier, deriving percentage by mapping the 4.0 ceiling directly to 100%.

#### Global 4-Point Preset Definition

```json
{
  "id": "global_4pt",
  "name": "US Global 4-Point System",
  "gradingSystem": "4-point scale",
  "evaluationModel": "absolute",
  "gradeScale": [
    {"min": 90, "max": 100, "grade": "A", "points": 4.0, "pass": true, "description": "Excellent"},
    {"min": 80, "max": 89, "grade": "B", "points": 3.0, "pass": true, "description": "Good"},
    {"min": 70, "max": 79, "grade": "C", "points": 2.0, "pass": true, "description": "Satisfactory"},
    {"min": 60, "max": 69, "grade": "D", "points": 1.0, "pass": true, "description": "Poor"},
    {"min": 0, "max": 59, "grade": "F", "points": 0.0, "pass": false, "description": "Fail"}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "(SGPA / 4.0) * 100",
  "cgpaToPercentage": "(CGPA / 4.0) * 100",
  "creditStructure": {
    "totalCreditsRequired": "120 for standard Bachelor's degree"
  },
  "passRules": {
    "minGraduationGPA": 2.0
  },
  "backlogPolicy": {
    "retakeRules": "Grade replacement varies by institution, commonly replacing the prior grade but leaving a transcript 'W' or fail marker"
  },
  "assessmentScheme": {
    "components": ["Continuous Evaluation", "Final Examination"],
    "split": "Varies by instructor syllabus"
  },
  "metadata": {
    "type": "Global Standard"
  },
  "specialFeatures": [
    "Foundational architecture for North American academic evaluation",
    "4.0 ceiling directly mapped to percentage conversion"
  ]
}
```

---

### 3.2 Generic Custom 10-Point System

This schema operates as the programmatic fallback for unmapped modern Indian institutions utilizing AICTE or UGC standard norms without complex anomaly injections (such as the MU piecewise formula or COEP LB logic). It assumes a linear $CGPA \times 9.5$ conversion.

#### Generic Custom 10-Point Preset Definition

```json
{
  "id": "generic_10pt",
  "name": "Generic 10-Point System",
  "gradingSystem": "10-point scale",
  "evaluationModel": "absolute",
  "gradeScale": [
    {"min": 80, "max": 100, "grade": "O", "points": 10, "pass": true},
    {"min": 70, "max": 79, "grade": "A+", "points": 9, "pass": true},
    {"min": 60, "max": 69, "grade": "A", "points": 8, "pass": true},
    {"min": 55, "max": 59, "grade": "B+", "points": 7, "pass": true},
    {"min": 50, "max": 54, "grade": "B", "points": 6, "pass": true},
    {"min": 45, "max": 49, "grade": "C", "points": 5, "pass": true},
    {"min": 40, "max": 44, "grade": "P", "points": 4, "pass": true},
    {"min": 0, "max": 39, "grade": "F", "points": 0, "pass": false}
  ],
  "sgpaFormula": "SUM(CourseCredits * GradePoints) / SUM(CourseCredits)",
  "cgpaFormula": "SUM(TotalSemesterPoints) / SUM(TotalCreditsEarned)",
  "sgpaToPercentage": "SGPA * 9.5",
  "cgpaToPercentage": "CGPA * 9.5",
  "creditStructure": {
    "totalCreditsRequired": "Configurable variable"
  },
  "passRules": {
    "minOverallMarks": 40
  },
  "backlogPolicy": {
    "atktRules": "Configurable variable"
  },
  "assessmentScheme": {
    "components": ["Continuous Assessments", "Final Examination"],
    "split": "50/50 baseline assumption"
  },
  "metadata": {
    "type": "Generic Base"
  },
  "specialFeatures": ["Acts as architectural fallback for dynamic simulation components"]
}
```

---

### 3.3 Generic Percentage-Based System

Designed strictly for processing legacy credentials preceding the widespread adoption of the Choice-Based Credit System (CBCS), this configuration abandons grade points entirely. It operates exclusively on aggregate marks, mapping performance directly to class thresholds (e.g., Distinction, First Class).

#### Generic Percentage-Based Preset Definition

```json
{
  "id": "generic_percentage",
  "name": "Generic Percentage-Based System",
  "gradingSystem": "Percentage scale",
  "evaluationModel": "absolute_percentage",
  "gradeScale": [
    {"min": 40, "max": 100, "grade": "Pass", "points": 100, "pass": true},
    {"min": 0, "max": 39, "grade": "Fail", "points": 0, "pass": false}
  ],
  "sgpaFormula": "NULL",
  "cgpaFormula": "NULL",
  "sgpaToPercentage": "Direct Map",
  "cgpaToPercentage": "Direct Map",
  "creditStructure": {
    "totalCreditsRequired": "Marks-based, credits largely informational/administrative"
  },
  "passRules": {
    "minOverallMarks": 40
  },
  "backlogPolicy": {
    "atktRules": "Raw marks carry-forward mechanism"
  },
  "assessmentScheme": {
    "components": ["Monolithic Annual/Semester Examination"],
    "split": "100% monolithic evaluation"
  },
  "metadata": {
    "type": "Legacy System"
  },
  "specialFeatures": [
    "Designed for legacy marks-based credential processing",
    "Aggregate percentage maps directly to class divisions"
  ]
}
```