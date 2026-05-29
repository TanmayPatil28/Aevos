"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Terminal, Layers, Grid as GridIcon, Sliders
} from "lucide-react";

import PageContainer from "@/components/layout/PageContainer";
import Section from "@/components/layout/Section";
import Grid from "@/components/layout/Grid";

import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import PremiumButton from "@/components/PremiumButton";

export default function UIShowcasePage() {
  const [inputText, setInputText] = useState("");
  const [inputError, setInputError] = useState("");
  const [selectValue, setSelectValue] = useState("");
  const [selectError, setSelectError] = useState("");

  const handleValidateInput = () => {
    if (!inputText) {
      setInputError("Neural payload is missing. Input required.");
    } else {
      setInputError("");
    }
  };

  const handleValidateSelect = () => {
    if (!selectValue) {
      setSelectError("Option alignment required.");
    } else {
      setSelectError("");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#000000]">
      {/* Dynamic Background Ambience */}
      
      <PageContainer className="pt-24 pb-32 max-w-7xl">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-white/20 pb-10">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-white/50 text-[10px] font-black uppercase tracking-[0.2em]"
            >
              <Terminal size={12} className="text-[#4F8EF7]" /> Dev Observatory Mode
            </motion.div>
            <h1 className="text-4xl sm:text-6xl font-black font-headline tracking-tighter text-white">
              UI System <span className="text-gradient bg-gradient-to-r from-[#4F8EF7] to-[#7C3AED]">Showcase</span>
            </h1>
            <p className="text-white/40 max-w-2xl font-medium leading-relaxed italic text-sm sm:text-base">
              GradeFlow design system validator. Verify style tokens, interactive states, responsive grids, and layout rules for regression-free deployments.
            </p>
          </div>

          <div className="flex gap-4">
            <PremiumButton variant="outline" className="text-xs" icon="rotate_right" onClick={() => {
              setInputText("");
              setInputError("");
              setSelectValue("");
              setSelectError("");
            }}>
              Reset States
            </PremiumButton>
          </div>
        </div>

        {/* SECTION 1: Design Tokens */}
        <Section spacing="lg">
          <div className="space-y-1 mb-8">
            <h2 className="text-2xl font-black font-headline text-white tracking-tight flex items-center gap-3">
              <Layers size={22} className="text-[#4F8EF7]" /> 01. Design Tokens
            </h2>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Core Styling Variables</p>
          </div>

          <Grid cols={3} gap="md">
            {/* Color System */}
            <Card className="p-8 space-y-6" variant="default">
              <h3 className="text-lg font-black text-white">Color System</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="h-16 rounded-2xl bg-[var(--color-primary)] border border-white/10 shadow-lg shadow-blue-500/10 flex items-end p-3">
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">Primary</span>
                  </div>
                  <p className="text-[10px] text-white/40 font-bold font-mono">#4F8EF7</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-2xl bg-[var(--color-secondary)] border border-white/10 shadow-lg shadow-purple-500/10 flex items-end p-3">
                    <span className="text-[10px] font-black text-white uppercase tracking-wider">Secondary</span>
                  </div>
                  <p className="text-[10px] text-white/40 font-bold font-mono">#7C3AED</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-2xl bg-[var(--color-bg)] border border-white/5 flex items-end p-3">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">Background</span>
                  </div>
                  <p className="text-[10px] text-white/40 font-bold font-mono">#050810</p>
                </div>
                <div className="space-y-2">
                  <div className="h-16 rounded-2xl bg-white/5 border border-white/10 flex items-end p-3">
                    <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">Surface</span>
                  </div>
                  <p className="text-[10px] text-white/40 font-bold font-mono">White @ 5%</p>
                </div>
              </div>
            </Card>

            {/* Typography */}
            <Card className="p-8 space-y-6" variant="default">
              <h3 className="text-lg font-black text-white">Typography Scale</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mb-1">Headline (Syncopate)</p>
                  <p className="font-headline font-black text-2xl text-white tracking-tighter">GRADIENT TRAJECTORY</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mb-1">Body text (Inter/Sans)</p>
                  <p className="font-body font-medium text-sm text-white/60 leading-relaxed italic">
                    The observatory tracks credit variances and academic metrics.
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest font-black mb-1">Data / Status</p>
                  <p className="font-bold text-xs uppercase tracking-widest text-[#4F8EF7]">
                    07.50 CGPA SCORE
                  </p>
                </div>
              </div>
            </Card>

            {/* Glassmorphism System */}
            <Card className="p-8 space-y-6" variant="default">
              <h3 className="text-lg font-black text-white">Refraction & Shadow</h3>
              <div className="space-y-4 text-xs font-bold text-white/60">
                <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                  <span>Backdrop Filter</span>
                  <code className="text-[#4F8EF7] font-mono">blur(40px)</code>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                  <span>Glass Border</span>
                  <code className="text-[#4F8EF7] font-mono">white / 5%</code>
                </div>
                <div className="flex items-center justify-between p-3.5 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                  <span>Depth Shadow</span>
                  <code className="text-[#4F8EF7] font-mono">shadow-[0_20px_50px_rgba(0,0,0,0.5)]</code>
                </div>
              </div>
            </Card>
          </Grid>
        </Section>

        {/* SECTION 2: UI Components */}
        <Section spacing="lg">
          <div className="space-y-1 mb-8">
            <h2 className="text-2xl font-black font-headline text-white tracking-tight flex items-center gap-3">
              <Sliders size={22} className="text-[#4F8EF7]" /> 02. UI Components
            </h2>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Enforced Reusable Primitives</p>
          </div>

          <Grid cols={2} gap="md">
            {/* Card Showcase */}
            <Card className="p-8 space-y-8" variant="default">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">Card Primitives</h3>
                <p className="text-xs text-white/40 italic">Variants & Interactive states</p>
              </div>

              <div className="space-y-6">
                <Card variant="default" padding="md">
                  <h4 className="text-sm font-black text-white mb-2">Default Card</h4>
                  <p className="text-xs text-white/50">Standard surface card with default glass design and padding.</p>
                </Card>

                <Card variant="accent" padding="md">
                  <h4 className="text-sm font-black text-[#4F8EF7] mb-2">Accent Highlight Card</h4>
                  <p className="text-xs text-white/50">Card with an active primary outline, perfect for focused content panels.</p>
                </Card>

                <Card variant="warning" padding="md">
                  <h4 className="text-sm font-black text-yellow-400 mb-2">Warning Status Card</h4>
                  <p className="text-xs text-white/50">Card with warnings or recommendations flags.</p>
                </Card>

                <Card variant="danger" padding="md">
                  <h4 className="text-sm font-black text-[var(--color-danger)] mb-2">Danger Action Card</h4>
                  <p className="text-xs text-white/50">Destructive contexts or telemetry errors.</p>
                </Card>
              </div>
            </Card>

            {/* Form Fields & Selectors */}
            <Card className="p-8 space-y-8" variant="default">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">Form Inputs & Selection</h3>
                <p className="text-xs text-white/40 italic">Zero-fragmentation data controls</p>
              </div>

              <div className="space-y-8">
                {/* Text Input State */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Input State Field</label>
                  <Input 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onBlur={handleValidateInput}
                    placeholder="Enter academic semester (e.g. Semester 01)..."
                    error={inputError}
                  />
                </div>

                {/* Dropdown Selector State */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Dropdown Selector</label>
                  <Select
                    value={selectValue}
                    onChange={(e) => setSelectValue(e.target.value)}
                    onBlur={handleValidateSelect}
                    error={selectError}
                    options={[
                      { value: "", label: "Select university preset..." },
                      { value: "spit", label: "S.P.I.T. (Mumbai)" },
                      { value: "mu", label: "Mumbai University (Generic)" },
                      { value: "bits", label: "BITS Pilani" }
                    ]}
                  />
                </div>

                {/* Badge Variants */}
                <div className="space-y-4 pt-4 border-t border-white/20">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Status Badge Indicators</label>
                  <div className="flex flex-wrap gap-3">
                    <Badge variant="neutral">Neutral</Badge>
                    <Badge variant="primary">Primary</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="danger">Danger</Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="text-[10px] text-white/30 font-bold mr-2">Sizes:</span>
                    <Badge variant="primary" size="sm">Small size</Badge>
                    <Badge variant="primary" size="md">Medium size</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </Grid>
        </Section>

        {/* SECTION 3: Layout Primitives */}
        <Section spacing="lg">
          <div className="space-y-1 mb-8">
            <h2 className="text-2xl font-black font-headline text-white tracking-tight flex items-center gap-3">
              <GridIcon size={22} className="text-[#4F8EF7]" /> 03. Layout Primitives
            </h2>
            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Consistency & Grids</p>
          </div>

          <Card className="p-8 space-y-6" variant="default">
            <div>
              <h3 className="text-lg font-black text-white mb-2">Adaptive Grid Layouts</h3>
              <p className="text-xs text-white/40 italic">Demonstrating the responsive Grid component columns.</p>
            </div>

            <div className="space-y-8">
              {/* Responsive 4-Column Grid Demo */}
              <div className="space-y-3">
                <p className="text-[10px] text-[#4F8EF7] font-black uppercase tracking-widest">4-Column Responsive Grid (`cols=4`)</p>
                <Grid cols={4} gap="sm">
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                    <span className="text-xs font-black text-white/60">Col 1</span>
                  </div>
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                    <span className="text-xs font-black text-white/60">Col 2</span>
                  </div>
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                    <span className="text-xs font-black text-white/60">Col 3</span>
                  </div>
                  <div className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                    <span className="text-xs font-black text-white/60">Col 4</span>
                  </div>
                </Grid>
              </div>

              {/* Spacing Spreads */}
              <div className="space-y-3 pt-6 border-t border-white/20">
                <p className="text-[10px] text-[#4F8EF7] font-black uppercase tracking-widest">Section Spacers</p>
                <div className="space-y-4 text-xs text-white/50 leading-relaxed italic">
                  <div className="flex gap-4 items-center">
                    <span className="w-20 font-mono text-[#4F8EF7] font-black uppercase">`Section`</span>
                    <span>Standardizes top/bottom margin and vertical space-y separation.</span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="w-20 font-mono text-[#4F8EF7] font-black uppercase">`PageContainer`</span>
                    <span>Provides centered 1280px max-width alignment with responsive paddings.</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Section>

      </PageContainer>
    </div>
  );
}
