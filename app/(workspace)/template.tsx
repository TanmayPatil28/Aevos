"use client";

import { motion } from "framer-motion";

/**
 * Next.js App Router template.tsx — re-mounts on every route change,
 * enabling seamless page-transition animations.
 */
export default function WorkspaceTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{
        duration: 0.5,
        ease: [0.32, 0.72, 0, 1],
        filter: { duration: 0.35 }
      }}
    >
      {children}
    </motion.div>
  );
}
