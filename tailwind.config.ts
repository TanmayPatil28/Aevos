import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Plus Jakarta Sans", "SF Pro Display", "SF Pro Icons", "var(--font-inter)", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
        display: ["SF Pro Display", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      colors: {
        background: "var(--aevos-background)",
        surface: "var(--aevos-surface)",
        "surface-raised": "var(--aevos-surface-raised)",
        "surface-overlay": "var(--aevos-surface-overlay)",
        
        foreground: "var(--aevos-text-primary)",
        "foreground-muted": "var(--aevos-text-secondary)",
        "foreground-tertiary": "var(--aevos-text-tertiary)",
        
        border: "var(--aevos-outline)",
        "border-strong": "var(--aevos-outline-variant)",
        "border-focus": "var(--aevos-on-surface)",
        
        brand: {
          DEFAULT: "var(--aevos-primary)",
          subtle: "var(--aevos-primary-fixed-dim)",
          secondary: "var(--aevos-secondary)",
          "secondary-subtle": "var(--aevos-secondary-fixed-dim)",
          tertiary: "var(--aevos-tertiary)",
          "tertiary-subtle": "var(--aevos-tertiary-fixed-dim)",
        },
        
        status: {
          success: "var(--aevos-status-success)",
          warning: "var(--aevos-status-warning)",
          critical: "var(--aevos-status-critical)",
          info: "var(--aevos-status-info)",
        },

        // Legacy mappings to prevent total breakage during Phase 2 transition
        primary: {
          DEFAULT: "var(--aevos-primary)",
        },
        secondary: {
          DEFAULT: "var(--aevos-secondary)",
        },
        error: {
          DEFAULT: "var(--aevos-status-critical)",
        },
        success: {
          DEFAULT: "var(--aevos-status-success)",
        },
        warning: {
          DEFAULT: "var(--aevos-status-warning)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        "card-standard": "var(--radius-card-standard)",
        "card-large": "var(--radius-card-large)",
        "card-massive": "var(--radius-card-massive)",
        full: "var(--radius-full)",
      },
      spacing: {
        "0.5": "var(--space-0.5)",
        "1": "var(--space-1)",
        "1.5": "var(--space-1.5)",
        "2": "var(--space-2)",
        "2.5": "var(--space-2.5)",
        "3": "var(--space-3)",
        "4": "var(--space-4)",
        "5": "var(--space-5)",
        "6": "var(--space-6)",
        "7": "var(--space-7)",
        "8": "var(--space-8)",
        "10": "var(--space-10)",
        "12": "var(--space-12)",
        "14": "var(--space-14)",
        "16": "var(--space-16)",
        "24": "var(--space-24)",
      },
      zIndex: {
        below: "var(--z-below)",
        base: "var(--z-base)",
        raised: "var(--z-raised)",
        sticky: "var(--z-sticky)",
        navigation: "var(--z-navigation)",
        dropdown: "var(--z-dropdown)",
        "modal-backdrop": "var(--z-modal-backdrop)",
        modal: "var(--z-modal)",
        toast: "var(--z-toast)",
        command: "var(--z-command)",
        "dynamic-island": "var(--z-dynamic-island)",
        "jarvis-overlay": "var(--z-jarvis-overlay)",
      },
      transitionTimingFunction: {
        spring: "var(--ease-spring)",
      },
      animation: {
        "mesh-fluid": "mesh 8s ease infinite",
      },
      keyframes: {
        mesh: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },
  plugins: [tailwindcssAnimate, require("@tailwindcss/typography"), require("tailwind-scrollbar")],
};
export default config;
