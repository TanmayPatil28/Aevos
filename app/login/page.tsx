"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.email || !data.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Welcome back to the Nebula!");
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden flex items-center justify-center">

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 glass-card rounded-[2rem] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] relative z-10 mx-4"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-headline font-black text-white mb-2">Welcome Back</h2>
          <p className="text-on-surface-variant font-medium">Continue your academic journey.</p>
        </div>

        <form onSubmit={loginUser} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 block">Email</label>
            <input
              id="login-email"
              type="email"
              className="w-full bg-surface-container-highest/50 border border-outline-variant focus:border-primary px-4 py-3 rounded-xl outline-none text-white transition-colors"
              placeholder="student@university.edu"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 block">Password</label>
            <input
              id="login-password"
              type="password"
              className="w-full bg-surface-container-highest/50 border border-outline-variant focus:border-primary px-4 py-3 rounded-xl outline-none text-white transition-colors"
              placeholder="••••••••"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-4 rounded-xl transition-all hover:shadow-[0_0_20px_var(--primary)] active:scale-[0.98] disabled:opacity-50 flex justify-center items-center mt-6"
          >
            {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : "Initialize Session"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-on-surface-variant">
          New to the observatory? <Link href="/register" className="text-primary font-bold hover:underline">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
}
