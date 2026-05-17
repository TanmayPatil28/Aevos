'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type GradingScale = '10' | '4' | 'percent';

export interface UniversityPreset {
  id: string;
  name: string;
  shortName: string;
  scaleMode: GradingScale;
  state?: string;
  type?: string;
  pattern?: string;
  gradingSystem?: string;
  sgpaFormula?: string;
  sgpaToPercentageFormula?: string;
  cgpaToPercentageFormula?: string;
  isRelativeGrading?: boolean;
  passCriteria?: {
    minCgpaForPromotion?: number;
    minCreditsPercentageForPromotion?: number;
    atktCondition?: string;
  };
  gradingRules?: {
    grade: string;
    points: number;
    minMarks: number;
    description?: string;
    isPass?: boolean;
  }[];
  specialFeatures?: {
    isVerified: boolean;
    hasLetterGrades?: boolean;
    defaultCreditsPerSem?: number[];
    erpIntegration?: string;
  };
}

export const UNI_PRESETS: UniversityPreset[] = [
  {
    id: 'jspm',
    name: 'JSPM RSCOE',
    shortName: 'JSPM',
    scaleMode: '10',
    state: 'Maharashtra',
    type: 'Autonomous Affiliated',
    pattern: '2023',
    gradingSystem: '10-point CBCS OBE',
    specialFeatures: {
      isVerified: true,
      hasLetterGrades: true,
      defaultCreditsPerSem: [21, 23, 20, 20, 20, 20, 20, 20],
      erpIntegration: 'Digicampus',
    },
  },
  {
    id: 'sppu',
    name: 'Savitribai Phule Pune University',
    shortName: 'SPPU',
    scaleMode: '10',
    state: 'Maharashtra',
    type: 'State Public University',
    pattern: '2019',
    gradingSystem: '10-point CBCS',
    sgpaFormula: 'SUM(C * G) / SUM(C)',
    sgpaToPercentageFormula: '(SGPA - 0.75) * 10',
    cgpaToPercentageFormula: 'CGPA * 8.9',
    gradingRules: [
      { grade: 'O', points: 10, minMarks: 80, description: 'Outstanding' },
      { grade: 'A+', points: 9, minMarks: 70, description: 'Excellent' },
      { grade: 'A', points: 8, minMarks: 60, description: 'Very Good' },
      { grade: 'B+', points: 7, minMarks: 55, description: 'Good' },
      { grade: 'B', points: 6, minMarks: 50, description: 'Above Average' },
      { grade: 'C', points: 5, minMarks: 45, description: 'Average' },
      { grade: 'P', points: 4, minMarks: 40, description: 'Pass' },
      { grade: 'F', points: 0, minMarks: 0, description: 'Fail', isPass: false },
    ],
  },
  {
    id: 'mu',
    name: 'Mumbai University',
    shortName: 'MU',
    scaleMode: '10',
    state: 'Maharashtra',
    type: 'State Public University',
    pattern: 'REV-2019 C-Scheme',
    gradingSystem: '10-point CBGS',
    cgpaToPercentageFormula: 'PIECEWISE: IF(CGPI < 7, 7.1*CGPI + 12, 7.4*CGPI + 12)',
    gradingRules: [
      { grade: 'O', points: 10, minMarks: 80, description: 'Outstanding' },
      { grade: 'P', points: 4, minMarks: 40, description: 'Pass' },
      { grade: 'F', points: 0, minMarks: 0, description: 'Fail', isPass: false },
    ],
  },
  {
    id: 'coep',
    name: 'COEP Technological University',
    shortName: 'COEP',
    scaleMode: '10',
    state: 'Maharashtra',
    type: 'Unitary Public University',
    pattern: 'NEP 2023-24',
    gradingSystem: 'Relative Double-Letter',
    isRelativeGrading: true,
  },
  {
    id: 'pccoe',
    name: 'Pimpri Chinchwad College of Engineering',
    shortName: 'PCCOE',
    scaleMode: '10',
    state: 'Maharashtra',
    type: 'Autonomous Affiliated',
    pattern: '2023 Regulations',
    gradingSystem: '10-point CBCS',
  },
  {
    id: 'vit',
    name: 'Vishwakarma Institute of Technology',
    shortName: 'VIT Pune',
    scaleMode: '10',
    state: 'Maharashtra',
    type: 'Autonomous Affiliated',
    pattern: 'A-24',
    gradingSystem: '10-point Hybrid (Absolute/Relative)',
  },
  {
    id: 'mitwpu',
    name: 'MIT World Peace University',
    shortName: 'MIT-WPU',
    scaleMode: '10',
    state: 'Maharashtra',
    type: 'Private University',
    gradingSystem: '10-point',
    sgpaToPercentageFormula: '(SGPA - 0.75) * 10',
    passCriteria: {
      minCgpaForPromotion: 5.0,
      minCreditsPercentageForPromotion: 50,
      atktCondition: 'CGPA < 5 AND Credits >= 50%',
    },
  },
  {
    id: 'dypiu',
    name: 'DY Patil International University',
    shortName: 'DYPIU',
    scaleMode: '10',
    state: 'Maharashtra',
    type: 'Private University',
    gradingSystem: '10-point CBCS',
    cgpaToPercentageFormula: 'CGPA * 10',
  },
  {
    id: 'bvdu',
    name: 'Bharati Vidyapeeth',
    shortName: 'BVDU',
    scaleMode: '10',
    state: 'Maharashtra',
    type: 'Deemed to be University',
    pattern: 'CBCS 2021',
    gradingSystem: '10-point',
  },
  {
    id: 'scoe',
    name: 'Sinhgad College of Engineering',
    shortName: 'SCOE',
    scaleMode: '10',
    state: 'Maharashtra',
    type: 'Affiliated (SPPU)',
    pattern: 'SPPU 2019',
    gradingSystem: '10-point CBCS',
    sgpaToPercentageFormula: '(SGPA - 0.75) * 10',
    gradingRules: [
      { grade: 'O', points: 10, minMarks: 80, description: 'Outstanding' },
      { grade: 'A+', points: 9, minMarks: 70, description: 'Excellent' },
      { grade: 'A', points: 8, minMarks: 60, description: 'Very Good' },
      { grade: 'B+', points: 7, minMarks: 55, description: 'Good' },
      { grade: 'B', points: 6, minMarks: 50, description: 'Above Average' },
      { grade: 'C', points: 5, minMarks: 45, description: 'Average' },
      { grade: 'P', points: 4, minMarks: 40, description: 'Pass' },
      { grade: 'F', points: 0, minMarks: 0, description: 'Fail', isPass: false },
    ],
  },
  // --- National Engineering Ecosystem ---
  {
    id: 'vtu',
    name: 'Visvesvaraya Technological University',
    shortName: 'VTU',
    scaleMode: '10',
    state: 'Karnataka',
    type: 'State Public University',
    pattern: '2022 Scheme',
    gradingSystem: '10-point Absolute',
    cgpaToPercentageFormula: '(CGPA - 0.75) * 10',
  },
  {
    id: 'au',
    name: 'Anna University',
    shortName: 'AU',
    scaleMode: '10',
    state: 'Tamil Nadu',
    type: 'State Public University',
    pattern: 'Regulation 2021',
    gradingSystem: '10-point Absolute',
  },
  {
    id: 'bits-pilani',
    name: 'BITS Pilani',
    shortName: 'BITS',
    scaleMode: '10',
    state: 'Rajasthan',
    type: 'Deemed University',
    gradingSystem: 'Unit-Based Alphanumeric',
  },
  {
    id: 'nit-council',
    name: 'National Institutes of Technology',
    shortName: 'NITs',
    scaleMode: '10',
    state: 'National',
    type: 'Institute of National Importance',
    gradingSystem: '10-point CBCS',
    cgpaToPercentageFormula: 'CGPA * 9.5',
  },
  {
    id: 'vit-vellore',
    name: 'Vellore Institute of Technology',
    shortName: 'VIT Vellore',
    scaleMode: '10',
    state: 'Tamil Nadu',
    type: 'Deemed University',
    gradingSystem: '10-point Relative',
  },
  {
    id: 'mahe',
    name: 'Manipal Institute of Technology',
    shortName: 'MAHE',
    scaleMode: '10',
    state: 'Karnataka',
    type: 'Deemed University',
    pattern: '2022 Scheme',
    gradingSystem: '10-point Relative (Z-Score)',
  },
  {
    id: 'dtu',
    name: 'Delhi Technological University',
    shortName: 'DTU',
    scaleMode: '10',
    state: 'Delhi',
    type: 'State Public University',
    gradingSystem: '10-point Relative',
  },
  {
    id: 'nsut',
    name: 'Netaji Subhas University of Technology',
    shortName: 'NSUT',
    scaleMode: '10',
    state: 'Delhi',
    type: 'State Public University',
    gradingSystem: '10-point Relative Clamped',
  },
  { id: 'custom_10', name: 'Custom (10.0 Scale)', shortName: 'Custom 10', scaleMode: '10' },
  {
    id: 'custom_percent',
    name: 'Custom (Percentage)',
    shortName: 'Custom %',
    scaleMode: 'percent',
  },
];

interface UniversityContextType {
  selectedUniId: string;
  setSelectedUniId: (id: string) => void;
  activePreset: UniversityPreset;
  scaleMode: GradingScale;
}

const UniversityContext = createContext<UniversityContextType | undefined>(undefined);

export function UniversityProvider({ children }: { children: ReactNode }) {
  const [selectedUniId, setSelectedUniId] = useState<string>('jspm');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gradeflow_global_uni');
      if (saved && UNI_PRESETS.find((u) => u.id === saved)) {
        setSelectedUniId(saved);
      }
    } catch (e) {
      console.error(e);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('gradeflow_global_uni', selectedUniId);
    }
  }, [selectedUniId, mounted]);

  const activePreset = UNI_PRESETS.find((u) => u.id === selectedUniId) || UNI_PRESETS[0];

  return (
    <UniversityContext.Provider
      value={{
        selectedUniId,
        setSelectedUniId,
        activePreset,
        scaleMode: activePreset.scaleMode,
      }}
    >
      {children}
    </UniversityContext.Provider>
  );
}

export function useUniversity() {
  const context = useContext(UniversityContext);
  if (context === undefined) {
    throw new Error('useUniversity must be used within a UniversityProvider');
  }
  return context;
}
