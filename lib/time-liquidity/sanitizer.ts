export function sanitizeAdherenceNeutralText(text: string): string {
  if (!text) return "";
  let result = text;
  
  const replacements = [
    { pattern: /(?<!-)\b(bunked|skipped)\b(?!-)/gi, replacement: "reallocated" },
    { pattern: /(?<!-)\b(bunking|skipping)\b(?!-)/gi, replacement: "reallocating" },
    { pattern: /(?<!-)\b(bunks|skips)\b(?!-)/gi, replacement: "reallocations" },
    { pattern: /(?<!-)\b(bunk|skip)\b(?!-)/gi, replacement: "reallocate" },
    { pattern: /(?<!-)\btruancy\b(?!-)/gi, replacement: "risk exposure" },
    { pattern: /(?<!-)\battendance risk\b(?!-)/gi, replacement: "risk exposure" },
    { pattern: /(?<!-)\bruin risk\b(?!-)/gi, replacement: "risk exposure" },
    { pattern: /(?<!-)\bdetention\b(?!-)/gi, replacement: "disciplinary review" },
    { pattern: /(?<!-)\battendance deficit\b(?!-)/gi, replacement: "portfolio adjustments" },
    { pattern: /(?<!-)\bTime Liquidity\b(?!-)/g, replacement: "Attendance Optimizer" },
    { pattern: /(?<!-)\btime liquidity\b(?!-)/g, replacement: "attendance optimizer" },
    { pattern: /(?<!-)\bPortfolio\b(?!-)/g, replacement: "Schedule" },
    { pattern: /(?<!-)\bportfolio\b(?!-)/g, replacement: "schedule" },
    { pattern: /(?<!-)\bReallocation Credits\b(?!-)/g, replacement: "Safe Skips" },
    { pattern: /(?<!-)\breallocation credits\b(?!-)/g, replacement: "safe skips" },
    { pattern: /(?<!-)\bReallocation Credit\b(?!-)/g, replacement: "Safe Skip" },
    { pattern: /(?<!-)\breallocation credit\b(?!-)/g, replacement: "safe skip" },
    { pattern: /(?<!-)\bRisk Exposure\b(?!-)/g, replacement: "Risk Level" },
    { pattern: /(?<!-)\brisk exposure\b(?!-)/g, replacement: "risk level" }
  ];
  
  replacements.forEach(({ pattern, replacement }) => {
    result = result.replace(pattern, (match) => {
      if (match === match.toUpperCase()) {
        return replacement.toUpperCase();
      }
      if (match[0] === match[0].toUpperCase()) {
        return replacement.charAt(0).toUpperCase() + replacement.slice(1);
      }
      return replacement;
    });
  });
  
  return result;
}
