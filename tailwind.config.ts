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
        headline: ["var(--font-headline)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
        label: ["var(--font-body)", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          container: "var(--primary-container)",
          fixed: "var(--primary-fixed)",
          "fixed-dim": "var(--primary-fixed-dim)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          container: "var(--secondary-container)",
        },
        tertiary: {
          DEFAULT: "var(--tertiary)",
          container: "var(--tertiary-container)",
        },
        surface: {
          DEFAULT: "var(--surface)",
          variant: "var(--surface-variant)",
          bright: "var(--surface-bright)",
          dim: "var(--surface-dim)",
          "container-low": "var(--surface-container-low)",
          container: "var(--surface-container)",
          "container-high": "var(--surface-container-high)",
          "container-highest": "var(--surface-container-highest)",
          "container-lowest": "var(--surface-container-lowest)",
        },
        "on-surface": {
          DEFAULT: "var(--on-surface)",
          variant: "var(--on-surface-variant)",
        },
        outline: {
          DEFAULT: "var(--outline)",
          variant: "var(--outline-variant)",
        },
        error: {
          DEFAULT: "var(--error)",
          container: "var(--error-container)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        premium: "var(--shadow-premium)",
        "premium-hover": "var(--shadow-premium-hover)",
      },
      spacing: {
        "os-micro": "0.5rem",   // 8px
        "os-component": "1.5rem", // 24px
        "os-section": "3rem",     // 48px
        "os-macro": "6rem",       // 96px
        "navbar-bubble": "52px",
      },
      width: {
        "navbar-desktop": "800px",
        "navbar-mobile": "300px",
        "navbar-spotlight": "90vw",
      },
      maxWidth: {
        "navbar-spotlight": "64rem",
      },
      animation: {
        "fade-in": "fade-in 300ms ease-in forwards",
      },
      transitionTimingFunction: {
        "os-smooth": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [tailwindcssAnimate, require("@tailwindcss/typography")],
};
export default config;
