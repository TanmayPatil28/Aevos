"use client";

import { motion } from "framer-motion";

/**
 * Next.js App Router template.tsx — re-mounts on every route change,
 * enabling seamless page-transition animations.
 */
export default function WorkspaceTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 25,
        mass: 0.8,
      }}
      style={{ willChange: "transform, opacity" }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
