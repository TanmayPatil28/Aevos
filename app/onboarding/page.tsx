'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Target,
  Building2,
  BookOpen,
  Check,
} from 'lucide-react';
import { useUniversity, UNI_PRESETS } from '@/components/providers/UniversityProvider';
import { useAcademicStore } from '@/lib/stores/academic-store';

const BRANCHES = [
  'Computer Science',
  'Information Technology',
  'Electronics',
  'Mechanical',
  'Civil',
  'Other',
];

const COMPANIES = [
  { name: 'Google', minCgpa: 8.5, category: 'dream' },
  { name: 'Microsoft', minCgpa: 8.0, category: 'dream' },
  { name: 'Amazon', minCgpa: 7.5, category: 'dream' },
  { name: 'TCS Digital', minCgpa: 7.0, category: 'target' },
  { name: 'Infosys', minCgpa: 6.5, category: 'safe' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setSelectedUniId } = useUniversity();
  const { setProfile, setSemesters } = useAcademicStore();

  // Form State
  const [universityId, setLocalUniId] = useState('');
  const [branch, setBranch] = useState('');
  const [admissionYear, setAdmissionYear] = useState<string>(new Date().getFullYear().toString());
  const [targetCgpa, setTargetCgpa] = useState<string>('');
  const [pastSemesters, setPastSemesters] = useState<
    { number: number; sgpa: string; totalCredits: string }[]
  >([]);
  const [dreamCompanies, setDreamCompanies] = useState<any[]>([]);

  const totalSteps = 5;

  const nextStep = () => setStep((s) => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        universityId,
        branch,
        admissionYear,
        targetCgpa,
        semesters: pastSemesters.filter((s) => s.sgpa !== ''),
        dreamCompanies,
      };

      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        // Update local store
        setProfile({
          universityId,
          branch,
          targetCgpa: targetCgpa ? parseFloat(targetCgpa) : null,
          onboardingDone: true,
        });

        // Push user to dashboard
        router.push('/dashboard');
      } else {
        console.error('Failed to save onboarding data');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const addSemester = () => {
    setPastSemesters([
      ...pastSemesters,
      { number: pastSemesters.length + 1, sgpa: '', totalCredits: '22' },
    ]);
  };

  const toggleCompany = (company: any) => {
    if (dreamCompanies.find((c) => c.name === company.name)) {
      setDreamCompanies(dreamCompanies.filter((c) => c.name !== company.name));
    } else {
      setDreamCompanies([...dreamCompanies, company]);
    }
  };

  const variants = {
    initial: { opacity: 0, x: 20, filter: 'blur(10px)' },
    animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
    exit: { opacity: 0, x: -20, filter: 'blur(10px)' },
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex flex-col items-center justify-center relative">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#4F8EF7]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#A855F7]/10 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Progress Bar */}
        <div className="mb-8 flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div key={i} className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: step > i ? '100%' : step === i + 1 ? '50%' : '0%' }}
                className="h-full bg-gradient-to-r from-[#4F8EF7] to-[#A855F7]"
              />
            </div>
          ))}
        </div>

        <div className="glass-card p-8 md:p-12 min-h-[400px] flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* STEP 1: University */}
            {step === 1 && (
              <motion.div
                key="step1"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1"
              >
                <div className="flex items-center gap-3 mb-6 text-[#4F8EF7]">
                  <GraduationCap size={28} />
                  <h2 className="text-2xl font-black text-white">Select Your University</h2>
                </div>
                <p className="text-white/50 mb-8">
                  GradeFlow personalizes calculations based on your university's grading system.
                </p>

                <div className="grid gap-3">
                  {UNI_PRESETS.map((uni) => (
                    <button
                      key={uni.id}
                      onClick={() => {
                        setLocalUniId(uni.id);
                        setSelectedUniId(uni.id);
                        nextStep();
                      }}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        universityId === uni.id
                          ? 'bg-[#4F8EF7]/10 border-[#4F8EF7] shadow-[0_0_20px_rgba(79,142,247,0.15)]'
                          : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                      }`}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-white text-lg">{uni.shortName}</span>
                        <span className="text-sm text-white/40">{uni.name}</span>
                      </div>
                      {universityId === uni.id && <Check className="text-[#4F8EF7]" />}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Branch & Year */}
            {step === 2 && (
              <motion.div
                key="step2"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1"
              >
                <div className="flex items-center gap-3 mb-6 text-[#A855F7]">
                  <BookOpen size={28} />
                  <h2 className="text-2xl font-black text-white">Academic Profile</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-white/70 mb-2">
                      Branch / Major
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {BRANCHES.map((b) => (
                        <button
                          key={b}
                          onClick={() => setBranch(b)}
                          className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                            branch === b
                              ? 'bg-[#A855F7]/20 border-[#A855F7] text-white'
                              : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-white/70 mb-2">
                      Admission Year
                    </label>
                    <input
                      type="number"
                      value={admissionYear}
                      onChange={(e) => setAdmissionYear(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:border-[#A855F7] focus:ring-1 focus:ring-[#A855F7] transition-all"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Past Semesters */}
            {step === 3 && (
              <motion.div
                key="step3"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1 flex flex-col"
              >
                <div className="flex items-center gap-3 mb-6 text-[#10B981]">
                  <TrendingUpIcon size={28} />
                  <h2 className="text-2xl font-black text-white">Academic History</h2>
                </div>
                <p className="text-white/50 mb-6">
                  Enter your past SGPA to calibrate predictions. You can skip this and add it later.
                </p>

                <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar max-h-[300px] pr-2">
                  {pastSemesters.map((sem, idx) => (
                    <div key={idx} className="flex gap-3 items-center">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex-1 flex justify-between items-center">
                        <span className="font-bold text-white/70">Semester {sem.number}</span>
                        <div className="flex gap-2 w-1/2">
                          <input
                            type="number"
                            placeholder="SGPA"
                            value={sem.sgpa}
                            onChange={(e) => {
                              const newSems = [...pastSemesters];
                              newSems[idx].sgpa = e.target.value;
                              setPastSemesters(newSems);
                            }}
                            className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-center text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addSemester}
                    className="w-full py-3 rounded-xl border border-dashed border-white/20 text-white/50 hover:text-white hover:border-white/40 transition-all font-medium text-sm flex items-center justify-center gap-2"
                  >
                    + Add Semester
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Target */}
            {step === 4 && (
              <motion.div
                key="step4"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1"
              >
                <div className="flex items-center gap-3 mb-6 text-[#F59E0B]">
                  <Target size={28} />
                  <h2 className="text-2xl font-black text-white">Set Your Target</h2>
                </div>
                <p className="text-white/50 mb-8">What CGPA are you aiming for upon graduation?</p>

                <div className="flex justify-center my-8">
                  <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-4 border-white/5">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="8.50"
                      value={targetCgpa}
                      onChange={(e) => setTargetCgpa(e.target.value)}
                      className="bg-transparent text-5xl font-black text-white text-center w-full focus:outline-none placeholder:text-white/20"
                    />
                    <div className="absolute -bottom-4 bg-[#F59E0B] text-black text-xs font-bold px-3 py-1 rounded-full">
                      CGPA Target
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Placement Goals */}
            {step === 5 && (
              <motion.div
                key="step5"
                variants={variants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex-1"
              >
                <div className="flex items-center gap-3 mb-6 text-[#EC4899]">
                  <Building2 size={28} />
                  <h2 className="text-2xl font-black text-white">Placement Goals</h2>
                </div>
                <p className="text-white/50 mb-6">
                  Select your dream companies. We'll track your eligibility based on their CGPA
                  cutoffs.
                </p>

                <div className="grid gap-3">
                  {COMPANIES.map((company) => {
                    const isSelected = dreamCompanies.some((c) => c.name === company.name);
                    return (
                      <button
                        key={company.name}
                        onClick={() => toggleCompany(company)}
                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-[#EC4899]/10 border-[#EC4899] shadow-[0_0_20px_rgba(236,72,153,0.15)]'
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05]'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isSelected ? 'bg-[#EC4899] text-white' : 'bg-white/10 text-white/50'}`}
                          >
                            {company.name[0]}
                          </div>
                          <div className="flex flex-col items-start">
                            <span className="font-bold text-white text-md">{company.name}</span>
                            <span className="text-xs text-white/40">
                              Min CGPA: {company.minCgpa}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="text-[#EC4899]" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
            <button
              onClick={prevStep}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                step === 1
                  ? 'opacity-0 pointer-events-none'
                  : 'bg-white/5 hover:bg-white/10 text-white/70'
              }`}
            >
              <ChevronLeft size={16} /> Back
            </button>

            {step < totalSteps ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED] text-white text-sm font-bold shadow-[0_0_20px_rgba(79,142,247,0.3)] hover:scale-105 transition-all"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-sm font-black shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105 transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Launch Dashboard'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendingUpIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
