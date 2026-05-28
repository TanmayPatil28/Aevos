export interface SubjectPerformance {
  subjectName: string;
  credits: number;
  internalMarksScore: number; // 0-100 percentage of internals scored
  attendancePercentage: number;
  isCore: boolean;
}

export interface BacklogProbability {
  subjectName: string;
  probability: number; // 0-100%
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  reasons: string[];
}

export const BacklogPredictor = {
  /**
   * Subject-wise failure probability engine based on internal marks, attendance, and credit load.
   */
  calculate(subjects: SubjectPerformance[]): BacklogProbability[] {
    return subjects.map((sub) => {
      let probability = 0;
      const reasons: string[] = [];

      // Attendance impact (highest weight)
      if (sub.attendancePercentage < 75) {
        probability += 40;
        reasons.push(`Attendance (${sub.attendancePercentage}%) is below mandatory threshold.`);
      } else if (sub.attendancePercentage < 80) {
        probability += 15;
        reasons.push(`Borderline attendance reduces margin for error.`);
      }

      // Internal marks impact
      if (sub.internalMarksScore < 40) {
        probability += 35;
        reasons.push(`Critical internal marks (${sub.internalMarksScore}%). Requires near-perfect external exam.`);
      } else if (sub.internalMarksScore < 60) {
        probability += 15;
        reasons.push(`Weak internal performance adds pressure to final exam.`);
      }

      // Subject difficulty/core multiplier
      if (sub.isCore) {
        probability += 10;
        reasons.push(`${sub.subjectName} is a high-complexity core subject.`);
      }

      if (sub.credits > 3) {
        probability += 5;
        reasons.push(`High-credit subject; failure will severely destabilize CGPA.`);
      }

      probability = Math.min(100, Math.round(probability));

      let riskLevel: "HIGH" | "MEDIUM" | "LOW" = "LOW";
      if (probability > 60) riskLevel = "HIGH";
      else if (probability > 30) riskLevel = "MEDIUM";

      if (probability < 20) {
        reasons.push("Performance indicators suggest a safe pass.");
      }

      return {
        subjectName: sub.subjectName,
        probability,
        riskLevel,
        reasons,
      };
    });
  },
};
