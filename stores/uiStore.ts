import { create } from 'zustand';

export interface ContextAction {
  id: string;
  label: string;
  icon: string;
  onClick: () => void;
  primary?: boolean;
}

interface UIState {
  // Context Bar State
  contextTitle: string;
  contextActions: ContextAction[];
  setContextBar: (title: string, actions: ContextAction[]) => void;
  clearContextBar: () => void;

  // Inspector State
  activeInspectorEntity: { 
    type: "COURSE" | "TERM" | "INTERVENTION" | "ROADMAP_NODE"; 
    id: string;
    data?: any;
  } | null;
  setInspectorEntity: (entity: UIState["activeInspectorEntity"]) => void;
  openInspector: (entity: UIState["activeInspectorEntity"]) => void;
  closeInspector: () => void;

  // JARVIS Resume State
  activeResumeData: {
    company: string;
    summary: string;
    skills: string[];
    coursework: string[];
    atsScore?: number;
    actionPlan?: string[];
    projects?: {
      name: string;
      techStack: string[];
      impact: string;
      isAIGenerated?: boolean;
    }[];
  } | null;
  setResumeData: (data: UIState["activeResumeData"]) => void;
  closeResume: () => void;

  // JARVIS Interview State
  activeInterviewData: { targetJD: string; detailedAudit: any } | null;
  setInterviewData: (data: UIState["activeInterviewData"]) => void;
  closeInterview: () => void;

  // JARVIS Command Center State
  isJarvisCommandCenterOpen: boolean;
  openJarvisCommandCenter: () => void;
  closeJarvisCommandCenter: () => void;
  toggleJarvisCommandCenter: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  contextTitle: "",
  contextActions: [],
  setContextBar: (title, actions) => set({ contextTitle: title, contextActions: actions }),
  clearContextBar: () => set({ contextTitle: "", contextActions: [] }),

  activeInspectorEntity: null,
  setInspectorEntity: (entity) => set({ activeInspectorEntity: entity }),
  openInspector: (entity) => set({ activeInspectorEntity: entity }),
  closeInspector: () => set({ activeInspectorEntity: null }),

  activeResumeData: null,
  setResumeData: (data) => set({ activeResumeData: data }),
  closeResume: () => set({ activeResumeData: null }),

  activeInterviewData: null,
  setInterviewData: (data) => set({ activeInterviewData: data }),
  closeInterview: () => set({ activeInterviewData: null }),

  isJarvisCommandCenterOpen: false,
  openJarvisCommandCenter: () => set({ isJarvisCommandCenterOpen: true }),
  closeJarvisCommandCenter: () => set({ isJarvisCommandCenterOpen: false }),
  toggleJarvisCommandCenter: () => set((state) => ({ isJarvisCommandCenterOpen: !state.isJarvisCommandCenterOpen })),
}));
