"use client";

import * as React from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 rounded-md hover:bg-neutral-800 transition-colors flex items-center justify-center text-neutral-400 hover:text-white"
      aria-label="Toggle theme"
    >
      <span className="material-symbols-outlined text-[20px]">
        {theme === "light" ? "dark_mode" : "light_mode"}
      </span>
    </button>
  );
}
