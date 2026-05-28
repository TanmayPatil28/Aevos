"use client";

import { motion } from "framer-motion";

interface PageHeroProps {
  headline: React.ReactNode;
  description: React.ReactNode;
}

export function PageHero({ headline, description }: PageHeroProps) {
  return (
    <motion.div 
      className="flex flex-col w-full mb-12"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
    >
      <h1 className="text-4xl md:text-5xl lg:text-[4rem] font-semibold tracking-tight leading-[1.05] mb-4 text-transparent bg-clip-text bg-gradient-to-br from-[#E0F2FE] to-[#7DD3FC]">
        {headline}
      </h1>
      <p className="text-lg md:text-xl text-[#A1A1AA] font-medium max-w-2xl leading-[1.4] tracking-tight">
        {description}
      </p>
    </motion.div>
  );
}
