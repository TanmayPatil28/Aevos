"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUSMStore } from "@/stores/usmStore";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowLeft, CheckCircle2, ChevronDown } from "lucide-react";

function CustomSelect({ 
  value, 
  onChange, 
  options 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find(o => o.value === value)?.label || value;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white/90 text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 focus:bg-white/[0.05] transition-all"
      >
        <span>{selectedLabel}</span>
        <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-[#111] border border-white/10 rounded-lg shadow-2xl overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  value === opt.value ? 'bg-white/10 text-white font-medium' : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CustomCombobox({
  value,
  onChange,
  options,
  placeholder
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredOptions = options.filter(opt => 
    opt.toLowerCase().includes(inputValue.toLowerCase())
  );

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleSelect = (val: string) => {
    setInputValue(val);
    onChange(val);
    setOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    onChange(e.target.value);
    setOpen(true);
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-white/90 text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 focus:bg-white/[0.05] transition-all"
      />
      <button 
        type="button" 
        onClick={() => {
          setOpen(!open);
          inputRef.current?.focus();
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
      )}

      <AnimatePresence>
        {open && filteredOptions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-[#111] border border-white/10 rounded-lg shadow-2xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar"
          >
            {filteredOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className="w-full text-left px-4 py-2.5 text-sm transition-colors text-white/60 hover:bg-white/[0.05] hover:text-white"
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const setStudentDetails = useUSMStore((state) => state.setStudentDetails);
  const setActiveInstitution = useUSMStore((state) => state.setActiveInstitution);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    institution: "jspm_university_wagholi",
    branch: "",
    field: "",
    division: "",
    prnNumber: "",
    currentYear: "1st Year",
  });

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("gradeflow_onboarding_draft");
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        // ignore parse errors
      }
    }
  }, []);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem("gradeflow_onboarding_draft", JSON.stringify(formData));
  }, [formData]);

  const firstName = formData.fullName.split(" ")[0] || "there";

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveInstitution(formData.institution as any);
    setStudentDetails({
      ...formData,
      isOnboarded: true,
    });
    localStorage.removeItem("gradeflow_onboarding_draft");
    setStep(3); // Go to finish step
    
    // Auto redirect after 2 seconds
    setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
  };

  return (
    <div className="flex min-h-screen w-full bg-[#0a0a0c]">
      <AuthBackground />

      <div className="flex w-full flex-col justify-center items-center lg:w-1/2 relative bg-[#0a0a0c] p-8">
        <div className="w-full max-w-md relative z-10">
          
          {/* Progress Indicators */}
          <div className="flex items-center gap-2 mb-12">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? "bg-white/90" : "bg-white/10"}`} 
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleNext}
                className="space-y-6"
              >
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-white/90 mb-2">Who are you?</h1>
                  <p className="text-sm text-white/50 mb-8">Let's set up your core identity.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Full Name</label>
                    <input 
                      required
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white/90 text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 focus:bg-white/[0.05] transition-all"
                      placeholder="e.g. Tanmay Anil Patil"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">PRN / Registration Number</label>
                    <input 
                      required
                      type="text"
                      value={formData.prnNumber}
                      onChange={(e) => setFormData({ ...formData, prnNumber: e.target.value })}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white/90 text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 focus:bg-white/[0.05] transition-all"
                      placeholder="e.g. 22458020124"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-8 bg-white text-black font-medium py-2.5 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 group"
                >
                  Continue
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.form>
            )}

            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <button type="button" onClick={() => setStep(1)} className="flex items-center gap-1 text-xs text-white/40 hover:text-white/80 transition-colors mb-4">
                    <ArrowLeft className="w-3 h-3" /> Back
                  </button>
                  <h1 className="text-3xl font-semibold tracking-tight text-white/90 mb-2">
                    Hey {firstName}.
                  </h1>
                  <p className="text-sm text-white/50 mb-8">Let's configure your academic rules.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Institution</label>
                    <CustomSelect
                      value={formData.institution}
                      onChange={(val) => setFormData({ ...formData, institution: val })}
                      options={[
                        { value: "jspm_university_wagholi", label: "JSPM University (Wagholi)" },
                        { value: "rscoe_autonomous_tathawade", label: "JSPM's RSCOE (Tathawade)" },
                        { value: "sppu_affiliated", label: "SPPU Affiliated College" }
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Field</label>
                      <CustomCombobox
                        value={formData.field}
                        onChange={(val) => setFormData({ ...formData, field: val })}
                        options={["B.Tech", "B.E.", "M.Tech", "MBA", "MCA", "BCA", "B.Sc"]}
                        placeholder="e.g. B.Tech"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Branch</label>
                      <CustomCombobox
                        value={formData.branch}
                        onChange={(val) => setFormData({ ...formData, branch: val })}
                        options={["Computer Engineering", "AI-ML", "Data Science", "IT", "Mechanical", "Civil", "E&TC", "Electrical"]}
                        placeholder="e.g. AI-ML"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Division</label>
                      <input 
                        type="text"
                        value={formData.division}
                        onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2.5 text-white/90 text-sm focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 focus:bg-white/[0.05] transition-all"
                        placeholder="e.g. A"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-white/50 mb-1.5">Current Year</label>
                      <CustomSelect
                        value={formData.currentYear}
                        onChange={(val) => setFormData({ ...formData, currentYear: val })}
                        options={[
                          { value: "1st Year", label: "1st Year" },
                          { value: "2nd Year (DSY/Regular)", label: "2nd Year (DSY/Regular)" },
                          { value: "3rd Year", label: "3rd Year" },
                          { value: "4th Year", label: "4th Year" }
                        ]}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-8 bg-white text-black font-medium py-2.5 rounded-lg hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 group"
                >
                  Enter Workspace
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.form>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-bold text-white/90 mb-2">Profile Configured!</h2>
                <p className="text-white/50 text-sm">Redirecting you to the dashboard...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
