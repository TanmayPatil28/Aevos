"use client";

import React from "react";
import { motion } from "framer-motion";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const avatarVariants = cva(
  "relative flex items-center justify-center shrink-0 rounded-full select-none overflow-hidden bg-transparent",
  {
    variants: {
      size: {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-xs",
        md: "h-10 w-10 text-sm",
        lg: "h-12 w-12 text-base",
        xl: "h-16 w-16 text-xl",
        "2xl": "h-[var(--space-24)] w-[var(--space-24)] text-3xl",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

export interface AvatarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  name?: string;
  mode?: "image" | "fallback" | "skeleton";
  online?: boolean;
}

const getInitials = (name: string) => {
  if (!name) return "";
  const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, ""); // fallback ASCII alphanumeric clean
  const parts = cleanName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    const originalChars = Array.from(name).filter(c => c.trim().length > 0);
    return originalChars.slice(0, 2).join("").toUpperCase();
  }
  const first = Array.from(parts[0])[0] || "";
  const second = parts.length > 1 ? Array.from(parts[parts.length - 1])[0] || "" : "";
  return (first + second).toUpperCase();
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, name, size = "md", mode, online, ...props }, ref) => {
    const [hasError, setHasError] = React.useState(false);

    // Determine active mode
    let activeMode: "image" | "fallback" | "skeleton" = "fallback";
    if (mode) {
      activeMode = mode;
    } else if (src && !hasError) {
      activeMode = "image";
    }

    return (
      <div
        ref={ref}
        className={cn(avatarVariants({ size }), className)}
        {...props}
      >
        {activeMode === "image" && src && (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="h-full w-full object-cover rounded-full"
            onError={() => setHasError(true)}
          />
        )}
        {activeMode === "fallback" && (
          <>
            {/* Deep dark glass base */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent" />
            {/* Frosted glass refraction layer */}
            <div className="absolute inset-0 rounded-full backdrop-blur-2xl bg-white/[0.03]" />
            {/* Top specular highlight — the bright crescent of light */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.15] via-transparent to-transparent" style={{ maskImage: 'linear-gradient(to bottom, black 0%, transparent 50%)' }} />
            {/* Inner edge glow for glass thickness */}
            <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_-1px_2px_rgba(255,255,255,0.05),_0_4px_20px_rgba(0,0,0,0.4)]" />
            {/* Subtle border for physical edge */}
            <div className="absolute inset-0 rounded-full border border-white/[0.08]" />
            {/* Text content */}
            <div
              className="relative h-full w-full flex items-center justify-center text-white/80 font-semibold uppercase rounded-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]"
              role="img"
              aria-label={name || "Avatar fallback"}
            >
              {getInitials(name || "")}
            </div>
          </>
        )}
        {activeMode === "skeleton" && (
          <>
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent" />
            <div className="absolute inset-0 rounded-full backdrop-blur-2xl bg-white/[0.03]" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.12] via-transparent to-transparent animate-pulse" style={{ maskImage: 'linear-gradient(to bottom, black 0%, transparent 50%)' }} />
            <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_-1px_2px_rgba(255,255,255,0.05),_0_4px_20px_rgba(0,0,0,0.4)]" />
            <div className="absolute inset-0 rounded-full border border-white/[0.08]" />
          </>
        )}
        {online && (
          <span className="absolute bottom-0 right-0 block w-2 h-2 rounded-full bg-status-success ring-2 ring-background" />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  max?: number;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
}

const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ children, max = 5, size = "md", className, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const childrenArray = React.Children.toArray(children);
    const totalChildren = childrenArray.length;
    const visibleChildren = childrenArray.slice(0, max);
    const overflowCount = totalChildren - max;

    // Size mapping for the overflow badge
    const overflowBadgeSizeStyles = {
      xs: "h-6 w-6 text-xs",
      sm: "h-8 w-8 text-xs",
      md: "h-10 w-10 text-sm",
      lg: "h-12 w-12 text-base",
      xl: "h-16 w-16 text-xl",
      "2xl": "h-[var(--space-24)] w-[var(--space-24)] text-3xl",
    };

    return (
      <div
        ref={ref}
        className={cn("flex items-center", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        <div
          className={cn(
            "flex items-center",
            isHovered ? "space-x-2" : "-space-x-2"
          )}
        >
          {visibleChildren.map((child, index) => {
            if (!React.isValidElement(child)) return null;

            // Override size of the Avatar child if not explicitly set
            const avatarProps = {
              size,
              ...child.props,
            };

            return (
              <motion.div
                key={index}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 17,
                  delay: index * 0.05,
                }}
                className="relative"
              >
                {React.cloneElement(child as React.ReactElement<AvatarProps>, avatarProps)}
              </motion.div>
            );
          })}
          {overflowCount > 0 && (
            <motion.div
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 17,
                delay: visibleChildren.length * 0.05,
              }}
              className={cn(
                "relative flex items-center justify-center rounded-full text-white/80 font-mono font-bold shrink-0 overflow-hidden",
                overflowBadgeSizeStyles[size]
              )}
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent" />
              <div className="absolute inset-0 rounded-full backdrop-blur-2xl bg-white/[0.03]" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/[0.15] via-transparent to-transparent" style={{ maskImage: 'linear-gradient(to bottom, black 0%, transparent 50%)' }} />
              <div className="absolute inset-0 rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_-1px_2px_rgba(255,255,255,0.05),_0_4px_20px_rgba(0,0,0,0.4)]" />
              <div className="absolute inset-0 rounded-full border border-white/[0.08]" />
              <div className="relative z-10 drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">+{overflowCount}</div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";

export { Avatar, AvatarGroup };
