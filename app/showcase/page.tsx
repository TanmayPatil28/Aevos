"use client";

import React, { useState, useRef, useEffect } from "react";
import { Play } from "lucide-react";
import { motion } from "framer-motion";

import Card from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarGroup } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tooltip } from "@/components/ui/tooltip";
import { Divider } from "@/components/ui/divider";
import { AppleCarousel } from "@/components/ui/apple-carousel";
import { AppleFeatureExplorer } from "@/components/ui/apple-feature-explorer";
import { FloatingPill } from "@/components/ui/floating-pill";
import { CircularArrowButton } from "@/components/ui/circular-arrows";
import { SegmentedControl } from "@/components/ui/segmented-control";

export default function UIShowcasePage() {
  const [btnInteractiveLoading, setBtnInteractiveLoading] = useState(false);
  const [badgeGroupKey, setBadgeGroupKey] = useState(0);
  const [removableBadges, setRemovableBadges] = useState<{
    id: string;
    label: string;
    variant: "brand" | "success" | "info" | "default" | "warning" | "critical";
  }[]>([
    { id: "1", label: "Apples", variant: "brand" },
    { id: "2", label: "Design", variant: "success" },
    { id: "3", label: "Editorial", variant: "info" }
  ]);
  const [interactiveInput, setInteractiveInput] = useState("Type something");
  const [interactiveInputError, setInteractiveInputError] = useState("");
  const [selectVal, setSelectVal] = useState("");

  // Apple Bible Premium Components States & Data
  const [activePillId, setActivePillId] = useState<string | number>("edit");
  const [isPillExpanded, setIsPillExpanded] = useState(false);
  const [segmentedValue, setSegmentedValue] = useState("overview");

  const carouselSlides = [
    {
      id: "slide-1",
      headline: (
        <>
          Longest battery life ever in a Mac. Up to <br />
          24 hours. Hit the road, Mac.
        </>
      ),
      imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop", // Airport / travel stock image as placeholder
      imageAlt: "Woman sitting in airport terminal with MacBook",
    },
    {
      id: "slide-2",
      headline: (
        <>
          Crisp Liquid Retina XDR display.<br />
          Extreme dynamic range and incredible contrast.
        </>
      ),
      imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop", // Screen stock image as placeholder
      imageAlt: "MacBook screen showing vibrant colors",
    },
    {
      id: "slide-3",
      headline: (
        <>
          M3 Max chip.<br />
          Mind-bending performance for pro workflows.
        </>
      ),
      imageUrl: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop", // Abstract tech stock image as placeholder
      imageAlt: "Abstract representation of computer chip",
    },
    {
      id: "slide-4",
      headline: (
        <>
          Gorgeous Space Black.<br />
          Pro-level dark mode, in real life.
        </>
      ),
      imageUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=2070&auto=format&fit=crop", // Dark laptop placeholder
      imageAlt: "Dark metallic laptop surface",
    },
    {
      id: "slide-5",
      headline: (
        <>
          Magic Keyboard with Touch ID.<br />
          A typing experience that feels just right.
        </>
      ),
      imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop", // Keyboard placeholder
      imageAlt: "Close up of laptop keyboard",
    },
  ];

  const gradeFlowFeatures = [
    {
      id: "ai-resume",
      title: "AI Resume Parsing",
      description: "Instantly extract core skills, education, and experience from any uploaded resume using our custom-trained LLM.",
      rightPanelContent: (
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-blue-400/10 flex items-center justify-center mb-4">
            <span className="text-4xl">📄</span>
          </div>
          <h3 className="text-3xl font-bold text-white tracking-tight">Smart Extraction</h3>
          <p className="text-white/60 max-w-md mt-2">Our neural engine automatically normalizes unstructured resume data into the Aevos standard schema.</p>
        </div>
      )
    },
    {
      id: "skill-matrix",
      title: "Skill Matrix View",
      description: "Visualize candidate capabilities across a multi-dimensional matrix. Identify gaps and strengths instantly.",
      rightPanelContent: (
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-purple-400/10 flex items-center justify-center mb-4">
            <span className="text-4xl">📊</span>
          </div>
          <h3 className="text-3xl font-bold text-white tracking-tight">Interactive Matrix</h3>
          <p className="text-white/60 max-w-md mt-2">Filter and sort thousands of candidates across 50+ technical dimensions in real-time.</p>
        </div>
      )
    },
    {
      id: "interview-prep",
      title: "Interview Prep",
      description: "Generate tailored interview questions based on the candidate's exact skill profile and job requirements.",
      rightPanelContent: (
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-emerald-400/10 flex items-center justify-center mb-4">
            <span className="text-4xl">🎙️</span>
          </div>
          <h3 className="text-3xl font-bold text-white tracking-tight">Dynamic Questions</h3>
          <p className="text-white/60 max-w-md mt-2">The AI actively generates situational questions designed to stress-test their claimed proficiencies.</p>
        </div>
      )
    },
    {
      id: "adaptive-roadmaps",
      title: "Adaptive Roadmaps",
      description: "Auto-generate personalized learning paths based on the candidate's target role and current skill gap.",
      rightPanelContent: (
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-cyan-400/10 flex items-center justify-center mb-4">
            <span className="text-4xl">🗺️</span>
          </div>
          <h3 className="text-3xl font-bold text-white tracking-tight">Dynamic Career Paths</h3>
          <p className="text-white/60 max-w-md mt-2">Pathways dynamically adjust as candidates complete modules and prove competencies.</p>
        </div>
      )
    },
    {
      id: "live-code-evaluation",
      title: "Live Code Evaluation",
      description: "Secure, sandboxed coding environments directly in the browser for technical assessments.",
      rightPanelContent: (
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-indigo-400/10 flex items-center justify-center mb-4">
            <span className="text-4xl">💻</span>
          </div>
          <h3 className="text-3xl font-bold text-white tracking-tight">Zero-Setup Sandboxing</h3>
          <p className="text-white/60 max-w-md mt-2">Evaluate algorithms in 15+ languages without candidates leaving the platform.</p>
        </div>
      )
    },
    {
      id: "enterprise-dashboards",
      title: "Enterprise Dashboards",
      description: "Organization-wide metrics tracking pipeline health, offer acceptance rates, and diversity goals.",
      rightPanelContent: (
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-rose-400/10 flex items-center justify-center mb-4">
            <span className="text-4xl">📈</span>
          </div>
          <h3 className="text-3xl font-bold text-white tracking-tight">Macro Analytics</h3>
          <p className="text-white/60 max-w-md mt-2">Identify bottlenecks in your hiring funnel instantly with real-time data visualization.</p>
        </div>
      )
    },
    {
      id: "global-ats-sync",
      title: "Global ATS Sync",
      description: "Bi-directional integration with Workday, Greenhouse, Lever, and 40+ other ATS platforms.",
      rightPanelContent: (
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-amber-400/10 flex items-center justify-center mb-4">
            <span className="text-4xl">🔄</span>
          </div>
          <h3 className="text-3xl font-bold text-white tracking-tight">Frictionless Handoff</h3>
          <p className="text-white/60 max-w-md mt-2">Candidates, notes, and scores flow securely back into your core HR stack automatically.</p>
        </div>
      )
    }
  ];

  const pillItems = [
    { id: "edit", label: "Edit" },
    { id: "preview", label: "Preview" },
  ];

  const expandedPillItems = [
    { id: "share", label: "Share" },
    { id: "delete", label: "Delete" },
  ];

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrameId: number;

    const resize = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth || window.innerWidth;
        canvas.height = canvas.parentElement.clientHeight || 400;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 35; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height || 400),
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        radius: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.3 + 0.1,
      });
    }

    const draw = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(157, 207, 202, ${p.alpha})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      animationFrameId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const triggerInteractiveLoading = () => {
    setBtnInteractiveLoading(true);
    setTimeout(() => setBtnInteractiveLoading(false), 2000);
  };

  const handleRemoveBadge = (id: string) => {
    setRemovableBadges((prev) => prev.filter((b) => b.id !== id));
  };

  const handleSelectChange = (value: string) => {
    setSelectVal(value);
  };

  useEffect(() => {
    if (interactiveInput.length > 0 && interactiveInput.length < 5) {
      setInteractiveInputError("Must be at least 5 characters.");
    } else {
      setInteractiveInputError("");
    }
  }, [interactiveInput]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-status-info/30 overflow-x-hidden">
      {/* ── Hero (Sparse, max 3 elements above fold) ── */}
      <div className="relative pt-32 pb-20 flex flex-col items-center justify-center text-center overflow-hidden">

        {/* Element 1: Category Tag */}
        <span className="text-[12px] leading-[16px] uppercase tracking-[0.12em] text-foreground-muted font-bold mb-4 z-10">
          Aevos
        </span>

        {/* Element 2: Premium Silver Gradient Headline (64px semibold) */}
        <h1
          className="text-[64px] font-semibold leading-[68px] tracking-[-0.5px] z-10"
          style={{
            backgroundImage: "linear-gradient(180deg, #FFFFFF 0%, #A1A1A6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Design Showcase
        </h1>

        {/* Element 3: Subtext (17px #86868B) */}
        <p className="text-base leading-[24px] text-foreground-muted max-w-[544px] mt-6 z-10">
          Every component in the Aevos design system, rendered with exact production tokens.
        </p>
      </div>

      {/* ── Components Layout ── */}
      <div className="max-w-[1400px] mx-auto px-6 md:px-8 pb-40 divide-y divide-white/10">
        
        {/* ── Button Section ── */}
        <section className="py-16">
          <div className="flex flex-col gap-2 mb-8">
            <span className="text-[12px] leading-[16px] font-semibold tracking-[0.12em] text-foreground-muted uppercase">Interactive Controls</span>
            <h2 className="text-[28px] leading-[36px] font-semibold text-foreground tracking-tight">Button</h2>
            <p className="text-base leading-[24px] text-foreground-muted">
              Triggers actions with clear visual states, supporting loading and disabled variants.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <Card variant="default" padding="lg" className="flex flex-col gap-6">
              <div>
                <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-4 uppercase tracking-wider">Variants</h4>
                <div className="flex flex-wrap gap-4">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </div>
              <Divider />
              <div>
                <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-4 uppercase tracking-wider">Sizes</h4>
                <div className="flex flex-wrap items-center gap-4">
                  <Button size="sm">Small</Button>
                  <Button size="md">Medium</Button>
                  <Button size="lg">Large</Button>
                  <Button size="xl">Extra Large</Button>
                </div>
              </div>
              <Divider />
              <div>
                <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-4 uppercase tracking-wider">Icon Buttons</h4>
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="icon" size="sm"><Play size={12} /></Button>
                  <Button variant="icon" size="md"><Play size={14} /></Button>
                  <Button variant="icon" size="lg"><Play size={16} /></Button>
                  <Button variant="icon" size="xl"><Play size={18} /></Button>
                </div>
              </div>
              <Divider />
              <div>
                <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-4 uppercase tracking-wider">States</h4>
                <div className="flex flex-wrap items-center gap-4">
                  <Button variant="primary" loading={true}>Loading state</Button>
                  <Button variant="primary" disabled>Disabled state</Button>
                  <Button variant="secondary" loading={btnInteractiveLoading} onClick={triggerInteractiveLoading}>
                    {btnInteractiveLoading ? "Click to Stop" : "Click to Load"}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ── Badge Section ── */}
        <section className="py-16">
          <div className="flex flex-col gap-2 mb-8">
            <span className="text-[12px] leading-[16px] font-semibold tracking-[0.12em] text-foreground-muted uppercase">Status Indicators</span>
            <h2 className="text-[28px] leading-[36px] font-semibold text-foreground tracking-tight">Badge</h2>
            <p className="text-base leading-[24px] text-foreground-muted">
              Visual tags for tags, statuses, and counts, designed to transition smoothly on load.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <Card variant="default" padding="lg" className="flex flex-col gap-6">
              <div>
                <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-4 uppercase tracking-wider">Variants</h4>
                <div className="flex flex-wrap gap-4">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="critical">Critical</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="brand">Brand</Badge>
                </div>
              </div>
              <Divider />
              <div>
                <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-4 uppercase tracking-wider">Sizes</h4>
                <div className="flex flex-wrap items-center gap-4">
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
              </div>
              <Divider />
              <div>
                <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-4 uppercase tracking-wider">Count</h4>
                <div className="flex flex-wrap items-center gap-4">
                  <Badge variant="default" count size="sm">4</Badge>
                  <Badge variant="info" count size="md">12</Badge>
                  <Badge variant="critical" count size="lg">99</Badge>
                </div>
              </div>
              <Divider />
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted uppercase tracking-wider">Removable</h4>
                  {removableBadges.length === 0 && (
                    <Button size="sm" variant="ghost" className="h-6" onClick={() => setRemovableBadges([
                      { id: "1", label: "Apples", variant: "brand" },
                      { id: "2", label: "Design", variant: "success" },
                      { id: "3", label: "Editorial", variant: "info" }
                    ])}>Reset Badges</Button>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 min-h-[32px] items-center">
                  {removableBadges.map((badge) => (
                    <Badge key={badge.id} variant={badge.variant} removable onRemove={() => handleRemoveBadge(badge.id)}>
                      {badge.label}
                    </Badge>
                  ))}
                  {removableBadges.length === 0 && (
                    <span className="text-xs leading-[16px] text-foreground-muted italic">All badges removed.</span>
                  )}
                </div>
              </div>
              <Divider />
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted uppercase tracking-wider">Badge Group (Staggered Mount)</h4>
                  <Button size="sm" variant="ghost" className="h-6" onClick={() => setBadgeGroupKey(prev => prev + 1)}>
                    Replay Animation
                  </Button>
                </div>
                <div key={badgeGroupKey} className="flex flex-wrap gap-4">
                  {["System", "Adaptive", "Fluid", "Apple", "Clean", "Responsive"].map((tag, idx) => (
                    <Badge key={tag} variant="brand" staggerIndex={idx}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* ── Card Section ── */}
        <section className="py-16">
          <div className="flex flex-col gap-2 mb-8">
            <span className="text-[12px] leading-[16px] font-semibold tracking-[0.12em] text-foreground-muted uppercase">Containers</span>
            <h2 className="text-[28px] leading-[36px] font-semibold text-foreground tracking-tight">Card</h2>
            <p className="text-base leading-[24px] text-foreground-muted">
              Provides structure and editorial layout, utilizing varying border radiuses and padding levels.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
            {/* Default Variant / Standard Padding */}
            <Card variant="default" padding="lg" className="flex flex-col justify-between min-h-[224px]">
              <div>
                <span className="text-[12px] leading-[16px] text-foreground-muted font-semibold uppercase tracking-wider">Default Variant</span>
                <h4 className="text-base leading-[24px] font-semibold text-foreground mt-2">Standard Card</h4>
                <p className="text-sm leading-[20px] text-foreground-muted mt-2">
                  {"Configured with a 28px border radius and standard 'lg' padding. Optimized for general modules and list items."}
                </p>
              </div>
              <span className="text-[12px] leading-[16px] text-foreground-muted mt-4 font-mono">{"padding=\"lg\" (24px)"}</span>
            </Card>

            {/* Accent Variant / Large Padding */}
            <Card variant="accent" padding="xl" className="flex flex-col justify-between min-h-[224px] bg-gradient-to-br from-surface to-surface-raised">
              <div>
                <span className="text-[12px] leading-[16px] text-brand font-semibold uppercase tracking-wider">Accent Variant</span>
                <h4 className="text-base leading-[24px] font-semibold text-foreground mt-2">Large Editorial Card</h4>
                <p className="text-sm leading-[20px] text-foreground-muted mt-2">
                  {"Configured with a 48px border radius and spacious 'xl' padding. Draws focus to hero elements."}
                </p>
              </div>
              <span className="text-[12px] leading-[16px] text-brand/70 mt-4 font-mono">{"padding=\"xl\" (32px)"}</span>
            </Card>
          </div>
        </section>

        {/* ── Input Section ── */}
        <section className="py-16">
          <div className="flex flex-col gap-2 mb-8">
            <span className="text-[12px] leading-[16px] font-semibold tracking-[0.12em] text-foreground-muted uppercase">Data Entry</span>
            <h2 className="text-[28px] leading-[36px] font-semibold text-foreground tracking-tight">Input</h2>
            <p className="text-base leading-[24px] text-foreground-muted">
              Form elements supporting inline labels, helper text, and real-time validation feedback.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="px-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                <div className="flex flex-col gap-6">
                  <Input
                    label="Default Input"
                    placeholder="Enter system value..."
                  />
                  <Input
                    label="Filled State"
                    defaultValue="Secure API Token Loaded"
                    readOnly
                  />
                  <Input
                    label="Disabled State"
                    disabled
                    defaultValue="Read-only Configuration"
                  />
                  <Input
                    label="Search Input"
                    variant="search"
                    placeholder="Search database..."
                  />
                </div>
                <div className="flex flex-col gap-6">
                  {/* Error state with shake animation */}
                  <div className="flex flex-col gap-2">
                    <Input
                      label="Error State (Interactive)"
                      value={interactiveInput}
                      onChange={(e) => setInteractiveInput(e.target.value)}
                      error={interactiveInputError || undefined}
                      placeholder="Type here..."
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setInteractiveInputError(
                            interactiveInputError ? "" : "System failure: Field verification failed."
                          );
                        }}
                      >
                        Toggle Error
                      </Button>
                    </div>
                  </div>
                  <Input
                    label="Password Input"
                    variant="password"
                    placeholder="Enter password..."
                  />
                  <Input
                    label="Multiline Textarea"
                    multiline
                    placeholder="Type long description here..."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Select Section ── */}
        <section className="py-16">
          <div className="flex flex-col gap-2 mb-8">
            <span className="text-[12px] leading-[16px] font-semibold tracking-[0.12em] text-foreground-muted uppercase">Selection Controls</span>
            <h2 className="text-[28px] leading-[36px] font-semibold text-foreground tracking-tight">Select</h2>
            <p className="text-base leading-[24px] text-foreground-muted">
              Standard option selectors with custom-styled arrow indicators and error highlight states.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="px-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                <Select
                  label="Standard Options"
                  value={selectVal}
                  onChange={handleSelectChange}
                  options={[
                    { value: "", label: "Select destination node..." },
                    { value: "main", label: "Main System Node" },
                    { value: "backup", label: "Redundant Cluster" },
                    { value: "sandbox", label: "Local Sandbox" },
                  ]}
                />
                <Select
                  label="Error State Options"
                  value=""
                  onChange={() => {}}
                  error="Selection is required to establish link."
                  options={[
                    { value: "", label: "Select connection..." },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Tooltip Section ── */}
        <section className="py-16">
          <div className="flex flex-col gap-2 mb-8">
            <span className="text-[12px] leading-[16px] font-semibold tracking-[0.12em] text-foreground-muted uppercase">Contextual info</span>
            <h2 className="text-[28px] leading-[36px] font-semibold text-foreground tracking-tight">Tooltip</h2>
            <p className="text-base leading-[24px] text-foreground-muted">
              Displays contextual information upon hover or focus, fully customizable by direction and trigger delay.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-6 px-2">
              <div>
                <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-6 uppercase tracking-wider">Directions</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 bg-white/[0.06] rounded-xl justify-items-center items-center">
                  <Tooltip content="A top aligned tooltip" position="top">
                    <Button variant="secondary" size="sm">Top Tooltip</Button>
                  </Tooltip>
                  <Tooltip content="A right aligned tooltip" position="right">
                    <Button variant="secondary" size="sm">Right Tooltip</Button>
                  </Tooltip>
                  <Tooltip content="A bottom aligned tooltip" position="bottom">
                    <Button variant="secondary" size="sm">Bottom Tooltip</Button>
                  </Tooltip>
                  <Tooltip content="A left aligned tooltip" position="left">
                    <Button variant="secondary" size="sm">Left Tooltip</Button>
                  </Tooltip>
                </div>
              </div>
              <Divider />
              <div>
                <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-3 uppercase tracking-wider">Delay</h4>
                <div className="flex flex-wrap items-center gap-4">
                  <Tooltip content="Appeared after 1000ms delay" position="top" delay={1000}>
                    <Button variant="secondary" size="sm">1s Delay Tooltip</Button>
                  </Tooltip>
                  <span className="text-xs leading-[16px] text-foreground-muted">Hover to test trigger delay.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Divider Section ── */}
        <section className="py-16">
          <div className="flex flex-col gap-2 mb-8">
            <span className="text-[12px] leading-[16px] font-semibold tracking-[0.12em] text-foreground-muted uppercase">Structure</span>
            <h2 className="text-[28px] leading-[36px] font-semibold text-foreground tracking-tight">Divider</h2>
            <p className="text-base leading-[24px] text-foreground-muted">
              Visually structures content blocks horizontally or vertically, supporting custom labeling.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-6 px-2">
              <div>
                <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-4 uppercase tracking-wider">Horizontal Layouts</h4>
                <div className="bg-white/[0.06] p-6 rounded-xl space-y-4">
                  <span className="text-xs leading-[16px] text-foreground-muted">Section Top</span>
                  <Divider />
                  <span className="text-xs leading-[16px] text-foreground-muted">Section Middle (Simple)</span>
                  <Divider label="Labeled Divider" />
                  <span className="text-xs leading-[16px] text-foreground-muted">Section Bottom</span>
                </div>
              </div>
              <Divider />
              <div>
                <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-4 uppercase tracking-wider">Vertical Layouts</h4>
                <div className="flex items-center justify-around h-24 bg-white/[0.06] rounded-xl p-4">
                  <span className="text-xs leading-[16px] text-foreground-muted">Point A</span>
                  <Divider orientation="vertical" />
                  <span className="text-xs leading-[16px] text-foreground-muted">Point B</span>
                  <Divider orientation="vertical" label="vs" />
                  <span className="text-xs leading-[16px] text-foreground-muted">Point C</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Avatar Section ── */}
        <section className="py-16">
          <div className="flex flex-col gap-2 mb-8">
            <span className="text-[12px] leading-[16px] font-semibold tracking-[0.12em] text-foreground-muted uppercase">User Identity</span>
            <h2 className="text-[28px] leading-[36px] font-semibold text-foreground tracking-tight">Avatar</h2>
            <p className="text-base leading-[24px] text-foreground-muted">
              Handles user representation from XS to 2XL sizes, featuring initial fallbacks, online status, and group overflow.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-6 px-2">
              <div>
                <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-4 uppercase tracking-wider">Sizes</h4>
                <div className="flex flex-wrap items-end gap-6 bg-white/[0.06] p-6 rounded-xl">
                  {(["xs", "sm", "md", "lg", "xl", "2xl"] as const).map((sz) => (
                    <div key={sz} className="flex flex-col items-center gap-2">
                      <Avatar size={sz} name="Apple Developer" />
                      <span className="text-[10px] leading-[12px] text-foreground-muted uppercase font-mono">{sz}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Divider />
              <div>
                <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-4 uppercase tracking-wider">Fallback Initials, Online indicator &amp; Skeleton</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 bg-white/[0.06] p-6 rounded-xl justify-items-center">
                  <div className="flex flex-col items-center gap-2">
                    <Avatar size="lg" name="Steve Jobs" />
                    <span className="text-[10px] leading-[12px] text-foreground-muted">Initials: SJ</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Avatar size="lg" name="👨‍💻 Engineer" />
                    <span className="text-[10px] leading-[12px] text-foreground-muted">Emoji Fallback</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Avatar size="lg" name="Active Account" online />
                    <span className="text-[10px] leading-[12px] text-foreground-muted">Online Status</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <Avatar size="lg" mode="skeleton" />
                    <span className="text-[10px] leading-[12px] text-foreground-muted">Skeleton Mode</span>
                  </div>
                </div>
              </div>
              <Divider />
              <div>
                <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-4 uppercase tracking-wider">Avatar Group (7 avatars: 5 visible + 2 overflow)</h4>
                <div className="flex items-center justify-between bg-white/[0.06] p-6 rounded-xl">
                  <AvatarGroup max={5} size="md">
                    <Avatar name="Alice Carter" />
                    <Avatar name="Brandon Lee" />
                    <Avatar name="Charlie Brown" />
                    <Avatar name="David Smith" />
                    <Avatar name="Ethan Hunt" />
                    <Avatar name="Fiona Gallagher" />
                    <Avatar name="George Lucas" />
                  </AvatarGroup>
                  <span className="text-xs leading-[16px] text-foreground-muted">Hover over avatars to spread the group view.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Apple Bible Premium Components Section ── */}
        <section className="py-16 border-t border-border/30">
          <div className="flex flex-col gap-2 mb-8">
            <span className="text-[12px] leading-[16px] font-semibold tracking-[0.12em] text-foreground-muted uppercase">Premium Elements</span>
          </div>
          <div className="flex flex-col gap-6 mb-12">
            <div>
              <h2 className="text-[28px] leading-[36px] font-semibold text-foreground tracking-tight">Apple Bible Premium Components</h2>
              <p className="text-base leading-[24px] text-foreground-muted">
                {"Five custom-designed micro-interactions that embody Apple's signature fluid mechanics, glassmorphism, and accessibility."}
              </p>
            </div>

            {/* FULL WIDTH: MacBook Pro Media Carousel */}
            <div className="w-full mt-6">
              <div className="max-w-7xl mx-auto px-4 mb-4">
                <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-2 uppercase tracking-wider">MacBook Pro Media Carousel</h4>
                <p className="text-xs text-foreground-muted">Large-format gallery with fluid cards, dark backdrop-blurred controls, and progress-tracking dots.</p>
              </div>
              <div className="w-[100vw] relative left-1/2 -translate-x-1/2">
                <AppleCarousel slides={carouselSlides} autoPlayInterval={6000} />
              </div>
            </div>

            {/* FULL WIDTH: Apple Feature Explorer */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={{
                hidden: { opacity: 0 },
                visible: { 
                  opacity: 1,
                  transition: { staggerChildren: 0.15 }
                }
              }}
              className="w-full mt-24 mb-16 overflow-visible"
            >
              <div className="max-w-[1400px] mx-auto px-4 md:px-8 mb-8">
                <motion.h2 
                  variants={{
                    hidden: { y: 100, opacity: 0, scale: 0.95 },
                    visible: { y: 0, opacity: 1, scale: 1, transition: { duration: 1.2, ease: [0.215, 0.61, 0.355, 1] } }
                  }}
                  className="text-[48px] md:text-[64px] font-semibold text-white tracking-tight leading-none mb-10"
                >
                  Take a closer look.
                </motion.h2>
              </div>
              <motion.div
                variants={{
                  hidden: { y: 100, opacity: 0, scale: 0.98 },
                  visible: { y: 0, opacity: 1, scale: 1, transition: { duration: 1.2, ease: [0.215, 0.61, 0.355, 1] } }
                }}
              >
                <AppleFeatureExplorer 
                  features={gradeFlowFeatures} 
                  className="w-[100vw] relative left-1/2 -translate-x-1/2 rounded-none"
                />
              </motion.div>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Col 1: Segmented Control & Other smaller components */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-6 px-2">
                <div>
                  <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-4 uppercase tracking-wider">Fluid Segmented Control</h4>
                  <p className="text-xs text-foreground-muted mb-4">Sliding active capsule with keyboard navigation (ArrowLeft/Right).</p>
                  <div className="flex flex-col items-center gap-4">
                    <SegmentedControl
                      options={[
                        { value: "overview", label: "Overview" },
                        { value: "specs", label: "Specifications" },
                        { value: "reviews", label: "Customer Reviews" }
                      ]}
                      value={segmentedValue}
                      onChange={setSegmentedValue}
                    />
                    <span className="text-xs text-foreground-muted">Active Option: <strong className="text-white capitalize">{segmentedValue}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Col 2: Floating Action Pill, and Circular Arrows */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-6 px-2">

                <div>
                  <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-4 uppercase tracking-wider">Floating Action Pill</h4>
                  <p className="text-xs text-foreground-muted mb-4">Sliding active background, supports keyboard navigation (Arrow/Home/End) and expandability.</p>
                  <div className="h-28 relative flex items-center justify-center">
                    <FloatingPill
                      items={pillItems}
                      expandedItems={expandedPillItems}
                      expandable
                      isExpanded={isPillExpanded}
                      onExpandChange={setIsPillExpanded}
                      activeId={activePillId}
                      onActiveChange={setActivePillId}
                    />
                    <div className="absolute bottom-2 left-4 text-[10px] text-foreground-muted">
                      Active Action: <strong className="text-white capitalize">{activePillId}</strong>
                    </div>
                  </div>
                </div>

                <Divider />

                <div>
                  <h4 className="text-xs leading-[16px] font-semibold text-foreground-muted mb-4 uppercase tracking-wider">Circular Navigation Arrows</h4>
                  <p className="text-xs text-foreground-muted mb-4">Standard navigation arrows with hover, active (press), and disabled states. High contrast focus indicator and touch target compliance.</p>
                  <div className="flex flex-wrap gap-6 items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] text-foreground-muted uppercase">Normal / Hover / Active</span>
                      <div className="flex gap-4">
                        <CircularArrowButton direction="left" aria-label="Demo Left Arrow" />
                        <CircularArrowButton direction="right" aria-label="Demo Right Arrow" />
                      </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[10px] text-foreground-muted uppercase">Disabled State</span>
                      <div className="flex gap-4">
                        <CircularArrowButton direction="left" disabled aria-label="Disabled Left" />
                        <CircularArrowButton direction="right" disabled aria-label="Disabled Right" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}

