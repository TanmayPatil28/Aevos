import { AuthBackground } from "@/components/auth/AuthBackground";
import { UnifiedAuthForm } from "@/components/auth/UnifiedAuthForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication | Aevos",
  description: "Sign in or create an account to start orchestrating your academic success.",
};

export default function AuthPage() {
  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Pane - Visual/Brand element (hidden on mobile, takes 50% on desktop) */}
      <AuthBackground />

      {/* Right Pane - Form element */}
      <div className="flex w-full flex-col justify-center items-center lg:w-1/2 relative bg-[#0a0a0c]">

        
        <div className="w-full relative z-10">
          <UnifiedAuthForm />
        </div>
      </div>
    </div>
  );
}
