import { cn } from "@/lib/cn";

interface GlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "danger";
  loading?: boolean;
}

export default function GlowButton({ 
  children, 
  className, 
  variant = "primary", 
  loading = false,
  disabled,
  ...props 
}: GlowButtonProps) {
  const baseClasses = "relative inline-flex items-center justify-center px-6 py-3 font-semibold rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-[var(--primary)] text-[#0A0F1E] hover:bg-blue-400 glow-shadow",
    secondary: "bg-[var(--secondary)] text-white hover:bg-purple-400 glow-shadow hover:shadow-[0_0_20px_0_var(--secondary)]",
    outline: "border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[#0A0F1E]",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20"
  };

  return (
    <button 
      className={cn(baseClasses, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
}
