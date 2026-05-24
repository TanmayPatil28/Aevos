import React from "react";

interface WorkspaceSectionProps {
  children: React.ReactNode;
  className?: string;
  spacing?: "default" | "tight" | "none";
}

export default function WorkspaceSection({ children, className = "", spacing = "default" }: WorkspaceSectionProps) {
  const gapClass = 
    spacing === "tight" ? "space-y-6" : 
    spacing === "none" ? "" : 
    "space-y-12";

  return (
    <section className={`w-full ${gapClass} ${className}`}>
      {children}
    </section>
  );
}
