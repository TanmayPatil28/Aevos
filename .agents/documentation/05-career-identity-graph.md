# Component Documentation: CareerIdentityGraph

## 1. Component Name and Path
- **Component Name**: `CareerIdentityGraph`
- **File Path**: `components/os/identity/CareerIdentityGraph.tsx`

## 2. Simulated Data/Actions
This component visualizes the user's career archetype positioning using an SVG-rendered radar chart, showing hardcoded axes ("AI Depth", "Core Tech", "Systems") and custom polygon points, alongside static positioning text, strongest signals, and recommended growth instructions.

### Simulated Data/Actions Code Snippets
The mock radar graph nodes and hardcoded SVG points (Lines 21–261):
```tsx
{/* Nodes */}
<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group">
  <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(99,102,241,0.5)]">
    <BrainCircuit className="w-5 h-5" />
  </div>
  <span className="text-[10px] uppercase font-bold text-slate-400 mt-2">AI Depth</span>
</div>

<div className="absolute bottom-4 right-4 flex flex-col items-center group">
  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(16,185,129,0.5)]">
    <Code2 className="w-5 h-5" />
  </div>
  <span className="text-[10px] uppercase font-bold text-slate-400 mt-2">Core Tech</span>
</div>

<div className="absolute bottom-4 left-4 flex flex-col items-center group">
  <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all shadow-[0_0_15px_rgba(244,63,94,0.5)]">
    <Cpu className="w-5 h-5" />
  </div>
  <span className="text-[10px] uppercase font-bold text-slate-400 mt-2">Systems</span>
</div>

{/* Connecting lines SVG simulation */}
<svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100">
  <polygon points="50,15 85,85 15,85" fill="rgba(99, 102, 241, 0.15)" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="1" />
</svg>
```

Hardcoded career trajectory descriptors (Lines 264–273):
```tsx
AI/ML Engineering Student focused on Computer Vision
...
Based on your recent projects and academic trajectory, you are strongest in AI concepts and backend architecture. Your profile indicates high readiness for AI-focused engineering roles.
...
{/* Strongest Signal */}
High consistency in model training epochs and Python data engineering.
...
{/* Recommended Growth */}
Add 1 more Full Stack deployment to balance your AI backend.
```

## 3. Database/API Migration Plan

### Step 1: Mapping Archetypes and Dimensions
We need to dynamically map the student's skills to three dimensions (or expand to more dimensions like Frontend, Backend, AI/ML, Systems, DevOps, Data Science):
- Create a server utility that categories skills inside `CareerProfile.skills` into structural buckets:
  - **AI Depth**: Skills like `TensorFlow`, `PyTorch`, `LLMs`, `Computer Vision`, `NLP`.
  - **Core Tech**: Skills like `JavaScript`, `React`, `HTML/CSS`, `TypeScript`, `Node.js`.
  - **Systems**: Skills like `C++`, `Rust`, `Docker`, `Kubernetes`, `OS`, `Database Design`, `Linux`.

### Step 2: Dynamic SVG Projection
Calculate values on a 0-100 scale for each axis based on the number of skills and course grades. Example mapping:
- Top vertex (AI Depth) at `(50, 50 - (AI_val * 0.35))`
- Bottom-Right vertex (Core Tech) at `(50 + (Core_val * 0.35 * cos(30)), 50 + (Core_val * 0.35 * sin(30)))`
- Bottom-Left vertex (Systems) at `(50 - (Sys_val * 0.35 * cos(30)), 50 + (Sys_val * 0.35 * sin(30)))`

### Step 3: API Integration
Define an endpoint `/api/career/archetype` which runs the categorization code and executes a prompt to Gemini using the student's courses (`Enrollment`) and projects (`CareerProfile.projects`) to generate the custom `strongestSignal` and `recommendedGrowth` texts. Bind `CareerIdentityGraph.tsx` to this endpoint.
