"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";

// Dynamically import Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function JarvisLottieIcon({
  isActive,
  onClick,
}: {
  isActive: boolean;
  onClick: () => void;
}) {
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    // In a real scenario, you'd fetch a premium Lottie JSON from your assets or URL.
    // For now, we attempt to load it, falling back to Lucide if unavailable.
    fetch("https://assets9.lottiefiles.com/packages/lf20_q5pk6p1k.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data))
      .catch((e) => console.log("Lottie load failed, using fallback"));
  }, []);

  return (
    <button
      onClick={onClick}
      className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group outline-none"
      aria-label="Toggle Jarvis Command Center"
    >
      {animationData ? (
        <div className="w-6 h-6 opacity-80 group-hover:opacity-100 transition-opacity">
          <Lottie animationData={animationData} loop={true} />
        </div>
      ) : (
        <Sparkles size={18} className="text-white/70 group-hover:text-white transition-colors" />
      )}
    </button>
  );
}
