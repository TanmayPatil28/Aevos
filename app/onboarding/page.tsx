"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUSMStore } from "@/stores/usmStore";
import { AuthBackground } from "@/components/auth/AuthBackground";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setActiveInstitution(formData.institution as any);
    setStudentDetails({
      ...formData,
      isOnboarded: true,
    });
    localStorage.removeItem("gradeflow_onboarding_draft");
    setStep(3); // Go to finish step
    
    try {
      const res = await fetch("/api/user/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        console.error("API error during onboarding", err);
        return; // Stop here if there's an error
      }
      
      // Auto redirect after 2 seconds using a hard navigation to bypass router cache
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 2000);
    } catch (error) {
      console.error("Failed to onboard user", error);
    }
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
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? "bg-brand" : "bg-white/10"}`} 
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
                <Card padding="lg" variant="default">
                  <div>
                    <h1 className="text-3xl font-semibold tracking-tight text-white/90 mb-2">Who are you?</h1>
                    <p className="text-sm text-white/50 mb-8">Let's set up your core identity.</p>
                  </div>

                  <div className="space-y-4">
                    <Input 
                      required
                      label="Full Name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Tanmay Anil Patil"
                    />

                    <Input 
                      required
                      label="PRN / Registration Number"
                      value={formData.prnNumber}
                      onChange={(e) => setFormData({ ...formData, prnNumber: e.target.value })}
                      placeholder="e.g. 22458020124"
                    />
                  </div>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-full mt-8"
                  >
                    Continue
                  </Button>
                </Card>
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
                <Card padding="lg" variant="default">
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
                    <Select
                      label="Institution"
                      value={formData.institution}
                      onChange={(val) => setFormData({ ...formData, institution: val })}
                      options={[
                        { value: "jspm_university_wagholi", label: "JSPM University (Wagholi)" },
                        { value: "rscoe_autonomous_tathawade", label: "JSPM's RSCOE (Tathawade)" },
                        { value: "sppu_affiliated", label: "SPPU Affiliated College" }
                      ]}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="Field"
                        value={formData.field}
                        onChange={(val) => setFormData({ ...formData, field: val })}
                        options={[
                          { value: "B.Tech", label: "B.Tech" },
                          { value: "B.E.", label: "B.E." },
                          { value: "M.Tech", label: "M.Tech" },
                          { value: "MBA", label: "MBA" },
                          { value: "MCA", label: "MCA" },
                          { value: "BCA", label: "BCA" },
                          { value: "B.Sc", label: "B.Sc" },
                        ]}
                      />
                      <Select
                        label="Branch"
                        value={formData.branch}
                        onChange={(val) => setFormData({ ...formData, branch: val })}
                        options={[
                          { value: "Computer Engineering", label: "Computer Engineering" },
                          { value: "AI-ML", label: "AI-ML" },
                          { value: "Data Science", label: "Data Science" },
                          { value: "IT", label: "IT" },
                          { value: "Mechanical", label: "Mechanical" },
                          { value: "Civil", label: "Civil" },
                          { value: "E&TC", label: "E&TC" },
                          { value: "Electrical", label: "Electrical" }
                        ]}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input 
                        label="Division"
                        value={formData.division}
                        onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                        placeholder="e.g. A"
                      />
                      <Select
                        label="Current Year"
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

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-full mt-8"
                  >
                    Enter Workspace
                  </Button>
                </Card>
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
