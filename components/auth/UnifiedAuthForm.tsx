"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { OAuthProviders } from "./OAuthProviders";
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";

type AuthMode = "login" | "register" | "magic_link";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  name: z.string().optional(),
});

type AuthFormData = z.infer<typeof authSchema>;

export function UnifiedAuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    reset();
  };

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    try {
      if (mode === "login") {
        if (!data.password) {
          toast.error("Password is required for login");
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;
        window.location.href = "/dashboard";
      } else if (mode === "register") {
        if (!data.password) {
          toast.error("Password is required for registration");
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.name,
            },
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account!");
        switchMode("login");
      } else if (mode === "magic_link") {
        const { error } = await supabase.auth.signInWithOtp({
          email: data.email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        toast.success("Magic link sent! Check your inbox.");
      }
    } catch (error: any) {
      toast.error(error.message || "Authentication failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Variants for smooth container expansion/contraction
  const containerVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: "easeIn" } },
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-center px-6 sm:px-8">
      <div className="mb-10 text-center sm:text-left">
        <h2 className="text-4xl font-bold tracking-tighter text-white/90">
          {mode === "login" && "Welcome back"}
          {mode === "register" && "Create an account"}
          {mode === "magic_link" && "Sign in with a link"}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "login" && "Enter your credentials to access your account."}
          {mode === "register" && "Join Aevos to orchestrate your academic journey."}
          {mode === "magic_link" && "We'll send a magic link to your email."}
        </p>
      </div>

      <OAuthProviders />

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/[0.08]"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-[#0a0a0c] px-4 text-white/40 uppercase tracking-widest text-[10px] font-bold">Or continue with</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-1">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    type="text"
                    {...register("name")}
                    className="w-full h-12 pl-12 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white font-medium placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.06] transition-all outline-none"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                <input
                  type="email"
                  {...register("email")}
                  className="w-full h-12 pl-12 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white font-medium placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.06] transition-all outline-none"
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            {mode !== "magic_link" && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Password
                  </label>
                  {mode === "login" && (
                    <button
                      type="button"
                      onClick={() => switchMode("magic_link")}
                      className="text-xs font-medium text-primary hover:underline hover:underline-offset-4"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
                  <input
                    type="password"
                    {...register("password")}
                    className="w-full h-12 pl-12 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white font-medium placeholder:text-white/30 focus:border-white/20 focus:bg-white/[0.06] transition-all outline-none"
                    placeholder="••••••••"
                  />
                </div>
                {errors.password && (
                  <p className="text-[0.8rem] font-medium text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group inline-flex w-full items-center justify-center rounded-full bg-white text-black py-4 text-[15px] font-bold hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 transition-all duration-300 ease-out disabled:opacity-50 disabled:pointer-events-none mt-4"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {mode === "login" && "Sign In"}
              {mode === "register" && "Create Account"}
              {mode === "magic_link" && "Send Magic Link"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
            </button>
          </form>
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 text-center text-sm text-white/50">
        {mode === "login" ? (
          <p>
            Don't have an account?{" "}
            <button
              onClick={() => switchMode("register")}
              className="font-bold text-white hover:text-brand transition-colors"
            >
              Sign up
            </button>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <button
              onClick={() => switchMode("login")}
              className="font-bold text-white hover:text-brand transition-colors"
            >
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
