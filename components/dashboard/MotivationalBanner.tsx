"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { Rocket, ArrowRight } from "lucide-react";
import Link from "next/link";
import Card from "../ui/Card";

const MotionCard = motion(Card);

interface MotivationalBannerProps {
  currentCgpa: number;
  targetCgpa: number;
}

const MotivationalBanner = memo(function MotivationalBanner({ currentCgpa, targetCgpa }: MotivationalBannerProps) {
  const diff = targetCgpa - currentCgpa;
  const isAbove = currentCgpa >= targetCgpa;

  return (
    <MotionCard
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="p-12 border-primary/20 overflow-hidden group"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        <div className="flex items-center gap-8 text-center md:text-left">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 rounded-[2.5rem] bg-surface-container flex items-center justify-center text-primary shadow-2xl shadow-primary/20 border border-primary/20"
          >
            <Rocket size={40} />
          </motion.div>
          
          <div className="space-y-2">
            <h3 className="text-3xl font-black font-headline text-white tracking-tighter">
              {isAbove 
                ? `You've reached your target of ${targetCgpa.toFixed(2)}!` 
                : `You are ${diff.toFixed(2)} CGPA away from your target.`}
            </h3>
            <p className="text-on-surface-variant font-medium text-lg leading-relaxed max-w-xl">
              {isAbove 
                ? "Incredible work! Keep maintaining this momentum to stay at the top." 
                : `Score above 9.5 GPA this semester to reach your goal of ${targetCgpa.toFixed(2)} CGPA.`}
            </p>
          </div>
        </div>

        <Link href="/planner">
          <motion.button
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
            className="group px-8 py-4 rounded-full bg-primary text-white font-bold flex items-center gap-3 shadow-xl shadow-primary/30 relative overflow-hidden"
          >
            <span className="relative z-10">Update My Plan</span>
            <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
            <motion.div 
              animate={{ opacity: [0.1, 0.4, 0.1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-white" 
            />
          </motion.button>
        </Link>
      </div>

      {/* Decorative Orbs */}
    </MotionCard>
  );
});

export default MotivationalBanner;
