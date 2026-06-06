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
  } | null;
  setResumeData: (data: UIState["activeResumeData"]) => void;
  closeResume: () => void;
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
}));
