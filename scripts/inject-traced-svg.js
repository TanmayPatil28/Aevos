const fs = require('fs');

const svgData = fs.readFileSync('public/brand/logo-extracted.svg', 'utf8');
const dMatch = svgData.match(/d="([^"]+)"/);

if (dMatch) {
  let d = dMatch[1];
  // Remove the first two bounding boxes. 
  // They are roughly 'M 0 512.001 ... M 0.496 512.500 ...'
  // The actual logo starts at 'M 478.500 25.648'
  const logoStart = d.indexOf('M 478.500 25.648');
  if (logoStart !== -1) {
    const cleanD = d.substring(logoStart);
    
    let component = `import React from "react";
import { cn } from "@/lib/cn";

export function AevosLogo({ className, inverted = false }: { className?: string, inverted?: boolean }) {
  return (
    <svg 
      viewBox="0 0 1024 1024" 
      fill="currentColor" 
      fillRule="evenodd"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("relative shrink-0 text-current", className)}
    >
      <path d="${cleanD}" />
    </svg>
  );
}`;

    fs.writeFileSync('components/ui/AevosLogo.tsx', component);
    console.log("Successfully updated AevosLogo.tsx with exact auto-traced pixel path.");
  }
}
