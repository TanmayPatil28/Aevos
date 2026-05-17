import { FormulaEngine } from './presets/formula-engine';

export function getGradePointFromPercentage(percentage: number): number {
  if (percentage >= 90) return 10;
  if (percentage >= 80) return 9;
  if (percentage >= 70) return 8;
  if (percentage >= 60) return 7;
  if (percentage >= 50) return 6;
  if (percentage >= 45) return 5;
  if (percentage >= 40) return 4;
  return 0; // Below 40 is F (Fail)
}

export function calculateSGPA(subjects: { credits: number; gradePoint: number }[]): number {
  if (subjects.length === 0) return 0;

  let totalCredits = 0;
  let totalWeightedPoints = 0;

  subjects.forEach((sub) => {
    totalCredits += sub.credits;
    totalWeightedPoints += Number(sub.credits) * Number(sub.gradePoint);
  });

  if (totalCredits === 0) return 0;
  return totalWeightedPoints / totalCredits;
}

export function calculateRequiredGPA(
  targetCGPA: number,
  currentCGPA: number,
  completedCredits: number,
  remainingCredits: number
): number {
  const totalCreditsAtEnd = completedCredits + remainingCredits;
  const targetTotalPoints = targetCGPA * totalCreditsAtEnd;
  const currentTotalPoints = currentCGPA * completedCredits;

  const requiredTotalPoints = targetTotalPoints - currentTotalPoints;
  const requiredGPA = requiredTotalPoints / remainingCredits;

  return requiredGPA;
}

export function getDifficultyLevel(requiredGPA: number): {
  label: string;
  color: string;
  borderColor: string;
  bgTint: string;
  subLabel: string;
} {
  if (requiredGPA > 9.5) {
    return {
      label: 'VERY HARD',
      color: 'text-red-400',
      borderColor: 'border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.4)]',
      bgTint: 'bg-red-500/5',
      subLabel: 'Requires maximum effort',
    };
  } else if (requiredGPA >= 8.0) {
    return {
      label: 'CHALLENGING',
      color: 'text-yellow-400',
      borderColor: 'border-yellow-500/60 shadow-[0_0_15px_rgba(234,179,8,0.4)]',
      bgTint: 'bg-yellow-500/5',
      subLabel: 'Requires consistent focus',
    };
  } else if (requiredGPA >= 7.0) {
    return {
      label: 'ACHIEVABLE',
      color: 'text-blue-400',
      borderColor: 'border-blue-500/60 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
      bgTint: 'bg-blue-500/5',
      subLabel: 'Manageable with dedication',
    };
  } else {
    return {
      label: 'EASY',
      color: 'text-green-400',
      borderColor: 'border-green-500/60 shadow-[0_0_15px_rgba(34,197,94,0.3)]',
      bgTint: 'bg-green-500/5',
      subLabel: 'Well within your reach',
    };
  }
}

export function gpaToPercentage(gpa: number, formula?: string): number {
  if (!gpa) return 0;

  // 1. Check for specific university formulas provided in presets
  if (formula) {
    return FormulaEngine.executeConversion(formula, gpa);
  }

  // 2. Default fallback: Linear interpolation
  if (gpa >= 10) return 95;
  if (gpa >= 9) return 85 + (gpa - 9) * 10;
  if (gpa >= 8) return 75 + (gpa - 8) * 10;
  if (gpa >= 7) return 65 + (gpa - 7) * 10;
  if (gpa >= 6) return 55 + (gpa - 6) * 10;
  if (gpa >= 5) return 50 + (gpa - 5) * 5;
  if (gpa >= 4) return 45 + (gpa - 4) * 5;
  return Math.max(0, Number((gpa * 11.25).toFixed(2)));
}
