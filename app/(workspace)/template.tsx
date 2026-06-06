"use client";

import { motion } from "framer-motion";

/**
 * Next.js App Router template.tsx — re-mounts on every route change,
 * enabling seamless page-transition animations.
 */
export default function WorkspaceTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        mass: 0.8,
      }}
      className="w-full h-full"
    >
      {children}
    </motion.div>
  );
}
