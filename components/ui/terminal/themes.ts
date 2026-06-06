// ─── Terminal Theme Definitions ─────────────────────────────────────────────

export interface TerminalTheme {
  name: string;
  label: string;
  bg: string;
  bgHeader: string;
  text: string;
  textMuted: string;
  prompt: string;
  command: string;
  error: string;
  success: string;
  system: string;
  info: string;
  border: string;
  borderActive: string;
  shadow: string;
  caret: string;
  promptSymbol: string;
  sandboxBorder: string;
  sandboxBg: string;
  sandboxText: string;
}

export const TERMINAL_THEMES: Record<string, TerminalTheme> = {
  default: {
    name: "default",
    label: "Default",
    bg: "rgba(5,5,5,0.95)",
    bgHeader: "#1c1c1e",
    text: "#ffffff",
    textMuted: "rgba(255,255,255,0.4)",
    prompt: "#bf5af2",
    command: "#ffffff",
    error: "#ff453a",
    success: "#32d74b",
    system: "rgba(255,255,255,0.4)",
    info: "#8ab4f8",
    border: "rgba(255,255,255,0.1)",
    borderActive: "rgba(255,255,255,0.3)",
    shadow: "rgba(0,0,0,0.5)",
    caret: "#32d74b",
    promptSymbol: "~%",
    sandboxBorder: "rgba(255,69,58,0.5)",
    sandboxBg: "rgba(255,69,58,0.1)",
    sandboxText: "#ff453a",
  },
  matrix: {
    name: "matrix",
    label: "Matrix",
    bg: "rgba(0,5,0,0.97)",
    bgHeader: "#001a00",
    text: "#00ff41",
    textMuted: "rgba(0,255,65,0.35)",
    prompt: "#00ff41",
    command: "#00ff41",
    error: "#ff0000",
    success: "#00ff41",
    system: "rgba(0,255,65,0.3)",
    info: "#39ff14",
    border: "rgba(0,255,65,0.15)",
    borderActive: "rgba(0,255,65,0.4)",
    shadow: "rgba(0,255,65,0.1)",
    caret: "#00ff41",
    promptSymbol: ">>",
    sandboxBorder: "rgba(255,0,0,0.5)",
    sandboxBg: "rgba(255,0,0,0.08)",
    sandboxText: "#ff0000",
  },
  dracula: {
    name: "dracula",
    label: "Dracula",
    bg: "rgba(40,42,54,0.97)",
    bgHeader: "#21222c",
    text: "#f8f8f2",
    textMuted: "rgba(248,248,242,0.4)",
    prompt: "#bd93f9",
    command: "#f8f8f2",
    error: "#ff5555",
    success: "#50fa7b",
    system: "#6272a4",
    info: "#8be9fd",
    border: "rgba(98,114,164,0.3)",
    borderActive: "rgba(189,147,249,0.5)",
    shadow: "rgba(40,42,54,0.6)",
    caret: "#bd93f9",
    promptSymbol: "λ",
    sandboxBorder: "rgba(255,85,85,0.5)",
    sandboxBg: "rgba(255,85,85,0.1)",
    sandboxText: "#ff5555",
  },
  catppuccin: {
    name: "catppuccin",
    label: "Catppuccin",
    bg: "rgba(30,30,46,0.97)",
    bgHeader: "#181825",
    text: "#cdd6f4",
    textMuted: "rgba(205,214,244,0.4)",
    prompt: "#cba6f7",
    command: "#cdd6f4",
    error: "#f38ba8",
    success: "#a6e3a1",
    system: "#585b70",
    info: "#89b4fa",
    border: "rgba(88,91,112,0.3)",
    borderActive: "rgba(203,166,247,0.5)",
    shadow: "rgba(30,30,46,0.6)",
    caret: "#f5e0dc",
    promptSymbol: "❯",
    sandboxBorder: "rgba(243,139,168,0.5)",
    sandboxBg: "rgba(243,139,168,0.1)",
    sandboxText: "#f38ba8",
  },
};

export type ThemeName = keyof typeof TERMINAL_THEMES;
