"use client";

/**
 * BackgroundEffects — Lightweight, static CSS-only background.
 * Replaces the previous 8-animation Framer Motion version for 60fps performance.
 * Uses only CSS gradients + a static noise texture. Zero JavaScript. Zero GPU animations.
 */
export default function BackgroundEffects() {
  return (
    <div className="fixed inset-0 -z-50 overflow-hidden bg-black pointer-events-none select-none" style={{ contain: "layout style paint" }}>
      
      {/* A. Static Nebula Glow (Pure CSS gradient, no animation) */}
      <div 
        className="absolute -top-[20%] -left-[10%] w-[80%] h-[80%] rounded-full opacity-[0.12]"
        style={{ 
          background: "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          willChange: "auto",
        }}
      />
      <div 
        className="absolute -bottom-[20%] -right-[15%] w-[70%] h-[70%] rounded-full opacity-[0.08]"
        style={{ 
          background: "radial-gradient(circle, var(--secondary) 0%, transparent 70%)",
          willChange: "auto",
        }}
      />

      {/* B. Vignette (CSS only) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_60%,rgba(0,0,0,0.9)_100%)]" />
      
      {/* C. Static Noise Texture (No SVG filter, pure CSS background-image) */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
        }}
      />
    </div>
  );
}
