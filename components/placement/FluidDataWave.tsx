"use client";

import { motion } from "framer-motion";

export default function FluidDataWave() {
  return (
    <div className="w-full mt-8 rounded-[32px] overflow-hidden relative z-10 flex flex-col h-[500px] border border-white/[0.04] bg-[#000000]">
      {/* Background Deep Glow */}
      <div className="absolute inset-0 bg-black opacity-90" />
      
      {/* Fluid Orbs */}
      <motion.div
        className="absolute w-[300px] h-[500px] bg-gradient-to-b from-[#0a84ff] to-[#bf5af2] rounded-[100%] blur-[90px] opacity-40 mix-blend-screen"
        animate={{
          x: [-50, 50, -50],
          y: [-20, 100, -20],
          scale: [1, 1.2, 1],
          rotate: [0, 10, -10, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        style={{ left: "-20%", top: "10%" }}
      />
      
      <motion.div
        className="absolute w-[250px] h-[400px] bg-gradient-to-b from-[#32d74b] to-[#0a84ff] rounded-[100%] blur-[90px] opacity-30 mix-blend-screen"
        animate={{
          x: [50, -50, 50],
          y: [150, -50, 150],
          scale: [1.2, 1, 1.2],
          rotate: [0, -15, 15, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        style={{ right: "-10%", top: "20%" }}
      />
      
      <motion.div
        className="absolute w-[350px] h-[400px] bg-gradient-to-b from-[#ff453a] to-[#bf5af2] rounded-[100%] blur-[100px] opacity-20 mix-blend-screen"
        animate={{
          x: [0, 80, -80, 0],
          y: [200, 300, 150, 200],
          scale: [0.8, 1.3, 0.9, 0.8]
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        style={{ left: "10%", top: "40%" }}
      />

      {/* SVG Wave Overlays for that Siri "Strand" Look */}
      <div className="absolute inset-0 opacity-60">
        <svg viewBox="0 0 100 400" preserveAspectRatio="none" className="w-full h-full">
          {/* Wave 1 */}
          <path
            d="M 50,0 Q 20,100 50,200 T 50,400"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="3"
            style={{ filter: "blur(4px)" }}
          >
            <animate attributeName="d" values="M 50,0 Q 20,100 50,200 T 50,400; M 50,0 Q 80,100 50,200 T 50,400; M 50,0 Q 20,100 50,200 T 50,400" dur="8s" repeatCount="indefinite" />
          </path>
          {/* Wave 2 */}
          <path
            d="M 50,0 Q 80,130 50,200 T 50,400"
            fill="none"
            stroke="url(#gradient2)"
            strokeWidth="4"
            style={{ filter: "blur(6px)" }}
          >
            <animate attributeName="d" values="M 50,0 Q 80,130 50,200 T 50,400; M 50,0 Q 10,130 50,200 T 50,400; M 50,0 Q 80,130 50,200 T 50,400" dur="12s" repeatCount="indefinite" />
          </path>
          {/* Wave 3 */}
          <path
            d="M 50,0 Q 0,80 50,250 T 50,400"
            fill="none"
            stroke="url(#gradient3)"
            strokeWidth="2"
            style={{ filter: "blur(2px)" }}
          >
            <animate attributeName="d" values="M 50,0 Q 0,80 50,250 T 50,400; M 50,0 Q 100,80 50,250 T 50,400; M 50,0 Q 0,80 50,250 T 50,400" dur="10s" repeatCount="indefinite" />
          </path>
          
          {/* Sharp Core Wave */}
          <path
            d="M 50,0 Q 20,100 50,200 T 50,400"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            strokeOpacity="0.4"
          >
            <animate attributeName="d" values="M 50,0 Q 20,100 50,200 T 50,400; M 50,0 Q 80,100 50,200 T 50,400; M 50,0 Q 20,100 50,200 T 50,400" dur="8s" repeatCount="indefinite" />
          </path>

          <defs>
            <linearGradient id="gradient1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#0a84ff" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#bf5af2" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="gradient3" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#32d74b" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Glossy Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
      <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.8)] pointer-events-none" />
      
      {/* Floating UI Elements */}
      <div className="absolute top-6 left-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
          <span className="text-[9px] font-black tracking-widest uppercase text-white/50">Processing Core</span>
        </div>
      </div>

      {/* Label */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className="flex gap-1.5 items-end h-4">
          <motion.div animate={{ height: [4, 12, 4] }} transition={{ duration: 1.2, repeat: Infinity }} className="w-[3px] bg-white/40 rounded-full" />
          <motion.div animate={{ height: [4, 16, 4] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }} className="w-[3px] bg-white/40 rounded-full" />
          <motion.div animate={{ height: [4, 10, 4] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-[3px] bg-white/40 rounded-full" />
          <motion.div animate={{ height: [4, 14, 4] }} transition={{ duration: 1.3, repeat: Infinity, delay: 0.1 }} className="w-[3px] bg-white/40 rounded-full" />
          <motion.div animate={{ height: [4, 8, 4] }} transition={{ duration: 0.9, repeat: Infinity, delay: 0.3 }} className="w-[3px] bg-white/40 rounded-full" />
        </div>
        <div className="text-[10px] font-black tracking-[0.3em] uppercase text-white/30">Active</div>
      </div>
    </div>
  );
}
