'use client';

import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { getGradePointFromPercentage } from '@/lib/calculations';
import { GRADING_SYSTEMS } from '@/lib/calculations/grading-systems';
import { useAcademicStore } from '@/lib/stores/academic-store';
import { useUniversity } from '@/components/providers/UniversityProvider';
import AnimatedCounter from '@/components/AnimatedCounter';
import StaggerContainer, { StaggerItem } from '@/components/StaggerContainer';
import PremiumButton from '@/components/PremiumButton';

interface Subject {
  id: string;
  name: string;
  credits: string;
  score: string;
  error?: string;
  type?: string;
}

export default function CalculatorPage() {
  const {
    profile,
    semesters,
    syncFromDatabase,
    setProfile,
    populateFromPreset,
    isLoading: isStoreLoading,
  } = useAcademicStore();
  const { activePreset, setSelectedUniId } = useUniversity();

  const [selectedSemesterNum, setSelectedSemesterNum] = useState(1);
  const [usePercentage, setUsePercentage] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Mathematics', credits: '', score: '' },
    { id: '2', name: 'Physics', credits: '', score: '' },
    { id: '3', name: 'Computer Science', credits: '', score: '' },
    { id: '4', name: 'English', credits: '', score: '' },
  ]);
  const [result, setResult] = useState<{ sgpa: number; totalCredits: number } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    syncFromDatabase();
  }, [syncFromDatabase]);

  // Sync subjects when store semesters change (after populate)
  useEffect(() => {
    const currentSem = semesters.find((s) => s.semesterNumber === selectedSemesterNum);
    if (currentSem && currentSem.subjects.length > 0) {
      setSubjects(
        currentSem.subjects.map((s) => ({
          id: s.id,
          name: s.name,
          credits: s.credits.toString(),
          score: s.gradePoint?.toString() || '',
          type: s.subjectType,
        }))
      );
    }
  }, [semesters, selectedSemesterNum]);

  const handlePopulate = async () => {
    // Ensure profile is set up for populate
    if (!profile?.universityId) {
      setProfile({ universityId: activePreset.id, branch: 'computer-engineering' });
    }
    await populateFromPreset(selectedSemesterNum);
    toast.success(`Loaded ${activePreset.shortName} curriculum!`);
  };

  const handleUniversityChange = async (newId: string) => {
    setSelectedUniId(newId);
    setProfile({ universityId: newId });
    toast.success('University preset updated!');
  };

  const addSubject = () => {
    setSubjects([...subjects, { id: Math.random().toString(), name: '', credits: '', score: '' }]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((s) => s.id !== id));
    } else {
      toast.error('You must have at least one subject');
    }
  };

  const handleChange = (id: string, field: keyof Subject, value: string) => {
    setSubjects(
      subjects.map((s) => (s.id === id ? { ...s, [field]: value, error: undefined } : s))
    );
  };

  const validateInputs = useCallback((): boolean => {
    let valid = true;

    const updated = subjects.map((sub) => {
      const credits = parseFloat(sub.credits);
      const score = parseFloat(sub.score);
      let error = '';

      if (!sub.name.trim()) error = 'Name required';
      else if (isNaN(credits) || credits < 1 || credits > 6) error = 'Credits: 1-6';
      else if (isNaN(score)) error = 'Score required';
      else if (usePercentage && (score < 0 || score > 100)) error = 'Marks: 0-100';
      else if (!usePercentage && (score < 0 || score > 10)) error = 'Grade: 0-10';

      if (error) valid = false;
      return { ...sub, error };
    });

    setSubjects(updated);
    return valid;
  }, [subjects, usePercentage]);

  const handleCalculate = () => {
    if (!validateInputs()) {
      toast.error('Please fix the errors highlighted in red.');
      return;
    }

    setIsCalculating(true);

    // 800ms artificial delay for satisfying feel
    setTimeout(() => {
      const parsedSubjects = subjects.map((sub) => {
        const credits = parseFloat(sub.credits);
        const score = parseFloat(sub.score);
        const gradePoint = usePercentage ? getGradePointFromPercentage(score) : score;
        return { credits, gradePoint };
      });

      let totalCredits = 0;
      let totalWeightedGradePoints = 0;

      parsedSubjects.forEach((s) => {
        totalCredits += s.credits;
        totalWeightedGradePoints += s.gradePoint * s.credits;
      });

      const sgpa = totalCredits > 0 ? totalWeightedGradePoints / totalCredits : 0;
      setResult({ sgpa, totalCredits });
      setIsCalculating(false);
      toast.success('Calculation complete!');
    }, 800);
  };

  const handleSave = async () => {
    if (!result) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semesterNumber: selectedSemesterNum,
          semesterName: `Semester ${selectedSemesterNum}`,
          subjects: subjects.map((s) => ({
            name: s.name,
            credits: s.credits,
            score: s.score, // This will be used as grade point in the backend
          })),
          sgpa: result.sgpa,
          cgpa: result.sgpa, // This will be recalculated correctly on dashboard
          total_credits: result.totalCredits,
        }),
      });

      if (!res.ok) throw new Error('Failed to save');

      // Refresh global store state
      await syncFromDatabase();

      setSaveSuccess(true);
      toast.success('Result saved to Academic OS!');
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
      toast.error('Error saving calculation. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto min-h-screen relative overflow-hidden">
      {/* Ambient Background Blur */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-primary/10 blur-[100px] opacity-60 mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-secondary/10 blur-[120px] opacity-60 mix-blend-screen" />
        <div className="absolute top-[40%] left-[50%] w-[30vw] h-[30vw] rounded-full bg-success/5 blur-[100px] opacity-40 mix-blend-screen transform -translate-x-1/2" />
      </div>

      {/* Hero Header */}
      <StaggerContainer className="text-center mb-16 flex flex-col items-center">
        <StaggerItem>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/20 text-primary text-sm font-semibold mb-6">
            <span className="material-symbols-outlined text-sm">calculate</span>
            CGPA Calculator
          </div>
        </StaggerItem>
        <StaggerItem>
          <h1 className="text-5xl md:text-6xl font-headline font-extrabold tracking-tight mb-6 bg-gradient-to-br from-on-surface via-on-surface/90 to-on-surface/40 bg-clip-text text-transparent drop-shadow-sm">
            Calculate Your CGPA Instantly
          </h1>
        </StaggerItem>
        <StaggerItem>
          <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
            Enter your subjects, credits, and marks. Get your CGPA in one click.
          </p>
        </StaggerItem>
      </StaggerContainer>

      {/* Main Content Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Left: Add Your Subjects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-8"
        >
          <div className="glass-card rounded-[2rem] p-8">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div className="space-y-1">
                <h2 className="text-xl font-headline font-bold text-on-surface tracking-tight">
                  Academic Record Details
                </h2>
                <p className="text-[10px] text-primary font-black uppercase tracking-widest">
                  {activePreset.name} ({activePreset.pattern || 'Standard'})
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePopulate}
                  disabled={isStoreLoading}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-secondary/10 text-secondary border border-secondary/20 font-bold hover:bg-secondary/20 transition-all active:scale-95 text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  {isStoreLoading ? 'Loading...' : 'Auto-Populate'}
                </button>
                <select
                  value={selectedSemesterNum}
                  onChange={(e) => setSelectedSemesterNum(Number(e.target.value))}
                  className="bg-surface-container/50 border border-outline-variant/30 rounded-xl px-4 py-2 text-sm font-bold text-on-surface outline-none focus:border-primary/50 transition-all"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <option key={num} value={num}>
                      Semester {num}
                    </option>
                  ))}
                </select>
                <button
                  onClick={addSubject}
                  className="flex items-center gap-2 px-5 py-2 rounded-full bg-primary text-white font-bold hover:shadow-[0_0_20px_rgba(80,143,248,0.3)] transition-all active:scale-95 text-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Subject
                </button>
              </div>
            </div>

            <div className="overflow-x-auto mb-8">
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="text-on-surface-variant/40 text-[10px] font-black uppercase tracking-[0.2em] border-b border-outline-variant/10">
                    <th className="pb-4 px-2 w-[40%]">Subject Name</th>
                    <th className="pb-4 px-2 w-[20%]">Credits</th>
                    <th className="pb-4 px-2 w-[25%]">Grade/Marks</th>
                    <th className="pb-4 px-2 text-center w-[15%]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {subjects.map((subject) => (
                      <motion.tr
                        key={subject.id}
                        layout
                        initial={{ opacity: 0, y: -20, backgroundColor: 'rgba(80, 143, 248, 0.1)' }}
                        animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
                        exit={{ opacity: 0, x: -50, height: 0, overflow: 'hidden' }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="group"
                      >
                        <td className="py-2.5 px-2">
                          <input
                            type="text"
                            value={subject.name}
                            onChange={(e) => handleChange(subject.id, 'name', e.target.value)}
                            className={`w-full bg-surface-container/30 hover:bg-surface-container/50 border border-transparent rounded-xl text-on-surface focus:bg-surface-container focus:border-primary/30 focus:shadow-[0_0_15px_rgba(80,143,248,0.15)] outline-none transition-all duration-300 py-3 px-4 ${subject.error && !subject.name.trim() ? 'border-error/50 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.5)] bg-error/5' : ''}`}
                            placeholder="e.g. Data Structures"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            value={subject.credits}
                            onChange={(e) => handleChange(subject.id, 'credits', e.target.value)}
                            className={`w-full bg-surface-container/30 hover:bg-surface-container/50 border border-transparent rounded-xl text-on-surface focus:bg-surface-container focus:border-primary/30 focus:shadow-[0_0_15px_rgba(80,143,248,0.15)] outline-none transition-all duration-300 py-3 px-4 ${subject.error && subject.error.includes('Credits') ? 'border-error/50 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.5)] bg-error/5' : ''}`}
                            placeholder="4"
                            min="1"
                            max="6"
                          />
                        </td>
                        <td className="py-2.5 px-2">
                          <input
                            type="number"
                            value={subject.score}
                            onChange={(e) => handleChange(subject.id, 'score', e.target.value)}
                            className={`w-full bg-surface-container/30 hover:bg-surface-container/50 border border-transparent rounded-xl text-on-surface focus:bg-surface-container focus:border-primary/30 focus:shadow-[0_0_15px_rgba(80,143,248,0.15)] outline-none transition-all duration-300 py-3 px-4 ${subject.error && (subject.error.includes('Score') || subject.error.includes('Marks') || subject.error.includes('Grade')) ? 'border-error/50 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.5)] bg-error/5' : ''}`}
                            placeholder={usePercentage ? 'e.g., 85' : 'e.g., 9'}
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          <div className="flex flex-col items-center gap-1">
                            <button
                              onClick={() => removeSubject(subject.id)}
                              className="text-on-surface-variant/30 hover:text-error transition-all p-2 rounded-xl border border-transparent hover:border-error/20 hover:bg-error/10 hover:shadow-[0_0_10px_rgba(248,113,113,0.15)] flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                            <AnimatePresence>
                              {subject.error && (
                                <motion.span
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="text-red-400 text-[10px]"
                                >
                                  {subject.error}
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            <div className="flex bg-surface-container-highest p-1 rounded-full w-fit mb-8 relative border border-outline-variant/30">
              <div
                className="absolute inset-y-1 bg-primary rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-0"
                style={{ width: 'calc(50% - 4px)', left: usePercentage ? '4px' : 'calc(50%)' }}
              />
              <button
                onClick={() => setUsePercentage(true)}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors duration-300 w-32 ${usePercentage ? 'text-white' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Percentage
              </button>
              <button
                onClick={() => setUsePercentage(false)}
                className={`relative z-10 px-6 py-2 rounded-full text-sm font-bold transition-colors duration-300 w-32 ${!usePercentage ? 'text-white' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                Grade Points
              </button>
            </div>

            <div
              onClick={handleCalculate}
              className={isCalculating ? 'opacity-70 pointer-events-none' : ''}
            >
              <PremiumButton
                variant="primary"
                className="w-full justify-between mt-4"
                icon={
                  isCalculating ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  ) : (
                    'arrow_forward'
                  )
                }
              >
                {isCalculating ? 'Calculating...' : 'Calculate Results'}
              </PremiumButton>
            </div>
          </div>
        </motion.div>

        {/* Right: Grade Scale Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-4"
        >
          <div className="glass-card rounded-none p-8 sticky top-28 border border-outline-variant">
            <h2 className="text-xl font-headline font-bold mb-6 text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">analytics</span>
              Scale Reference
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] px-4">
                <span>Range</span>
                <span>Grade</span>
                <span>Pts</span>
              </div>
              <div className="space-y-2.5">
                {(activePreset.gradingRules || GRADING_SYSTEMS['custom-10'].scale).map(
                  (row: any, i: number) => (
                    <div
                      key={i}
                      className="flex justify-between items-center bg-surface-container/40 px-5 py-3.5 rounded-none border border-outline-variant/30 hover:bg-surface-container-high hover:border-primary/40 hover:shadow-sm transition-all group"
                    >
                      <span className="text-on-surface-variant group-hover:text-on-surface font-medium text-xs w-20">
                        {row.minMarks !== undefined
                          ? `>= ${row.minMarks}%`
                          : row.minPercentage !== undefined
                            ? `${row.minPercentage}%+`
                            : '---'}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-none text-xs bg-primary/10 text-primary font-bold w-auto border border-transparent group-hover:border-current transition-colors`}
                      >
                        {row.grade}
                      </span>
                      <span className={`font-black tracking-tight text-on-surface w-6 text-right`}>
                        {row.points || row.gradePoint}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Result Section */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-headline font-black mb-8 text-on-surface">
              Semester Results
            </h2>
            <StaggerContainer
              staggerDelay={0.15}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12"
            >
              <StaggerItem>
                <div className="glass-card rounded-[2.5rem] p-10 border-t-4 border-primary shadow-premium hover:-translate-y-2 transition-all duration-500 group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors" />
                  <p className="text-xs font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] mb-4">
                    Semester SGPA
                  </p>
                  <h3 className="text-6xl font-black font-headline text-primary tracking-tighter group-hover:scale-105 transition-transform origin-left">
                    <AnimatedCounter target={result.sgpa} decimals={2} />
                  </h3>
                  <div className="mt-6 flex items-center gap-2 text-primary font-bold text-sm bg-primary/5 w-fit px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm">trending_up</span> Top Tier
                  </div>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="glass-card rounded-[2.5rem] p-10 border-t-4 border-secondary shadow-premium hover:-translate-y-2 transition-all duration-500 group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-secondary/10 transition-colors" />
                  <p className="text-xs font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] mb-4">
                    Earned Credits
                  </p>
                  <h3 className="text-6xl font-black font-headline text-secondary tracking-tighter group-hover:scale-105 transition-transform origin-left">
                    <AnimatedCounter target={result.totalCredits} />
                  </h3>
                  <div className="mt-6 flex items-center gap-2 text-secondary font-bold text-sm bg-secondary/5 w-fit px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm">verified</span> Academic
                    Load
                  </div>
                </div>
              </StaggerItem>
              <StaggerItem>
                <div className="glass-card rounded-[2.5rem] p-10 border-t-4 border-success shadow-premium hover:-translate-y-2 transition-all duration-500 group overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-success/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-success/10 transition-colors" />
                  <p className="text-xs font-bold text-on-surface-variant/50 uppercase tracking-[0.2em] mb-4">
                    Performance Indicator
                  </p>
                  <motion.h3
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.6 }}
                    className="text-4xl lg:text-5xl font-black font-headline text-success tracking-tighter group-hover:scale-105 transition-transform origin-left"
                  >
                    {result.sgpa >= 9
                      ? 'LEGENDARY'
                      : result.sgpa >= 8
                        ? 'ELITE'
                        : result.sgpa >= 7
                          ? 'STABLE'
                          : 'RECOVERY'}
                  </motion.h3>
                  <div className="mt-6 flex items-center gap-2 text-success font-bold text-sm bg-success/5 w-fit px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm">stars</span> Grade Status
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-[2rem] p-8 mb-8 overflow-x-auto"
            >
              <h3 className="text-xl font-headline font-bold mb-6 text-on-surface">
                Subject Breakdown
              </h3>
              <table className="w-full text-left min-w-[500px]">
                <thead>
                  <tr className="text-on-surface-variant/60 text-xs font-bold uppercase tracking-widest border-b border-outline-variant/10">
                    <th className="pb-4 px-2">Subject Name</th>
                    <th className="pb-4 px-2">Credits</th>
                    <th className="pb-4 px-2">Score</th>
                    <th className="pb-4 px-2">Grade Point</th>
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((s) => {
                    const gradePoint = usePercentage
                      ? getGradePointFromPercentage(parseFloat(s.score) || 0)
                      : parseFloat(s.score) || 0;
                    return (
                      <tr
                        key={s.id}
                        className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50 transition-colors"
                      >
                        <td className="py-4 px-2 font-medium text-on-surface">
                          {s.name || 'Unnamed'}
                        </td>
                        <td className="py-4 px-2 text-on-surface-variant">{s.credits}</td>
                        <td className="py-4 px-2 text-on-surface-variant">{s.score}</td>
                        <td className="py-4 px-2 font-bold text-primary">
                          {gradePoint.toFixed(1)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </motion.div>

            {/* Save Section */}
            <div className="glass-card rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h3 className="text-2xl font-headline font-black mb-2 text-on-surface">
                  Secure These Results
                </h3>
                <p className="text-on-surface-variant">
                  Sync your GPA to your cloud dashboard to track semester-on-semester progress.
                </p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <div
                  onClick={handleSave}
                  className={`w-full ${isSaving ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <PremiumButton
                    variant={saveSuccess ? 'outline' : 'primary'}
                    className="w-full justify-between"
                    icon={
                      isSaving ? (
                        <svg
                          className="animate-spin h-4 w-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                      ) : saveSuccess ? (
                        'check_circle'
                      ) : (
                        'cloud_upload'
                      )
                    }
                  >
                    {isSaving ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save to Dashboard'}
                  </PremiumButton>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col md:flex-row justify-center items-center gap-6 mt-6 pb-10"
      >
        <Link href="/" className="w-full md:w-64">
          <PremiumButton variant="outline" icon="arrow_back" className="w-full justify-between">
            Back to Home
          </PremiumButton>
        </Link>
        <Link href="/planner" className="w-full md:w-64">
          <PremiumButton variant="primary" icon="calendar_month" className="w-full justify-between">
            Plan Semester
          </PremiumButton>
        </Link>
      </motion.div>
    </main>
  );
}
