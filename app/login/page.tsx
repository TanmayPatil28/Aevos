"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const [data, setData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const loginUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.email || !data.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success("Welcome back to the Nebula!");
      router.push("/dashboard");
      router.refresh();
    }
    setLoading(false);
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 glass-card rounded-[2rem] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] relative z-10 mx-4"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-headline font-black text-white mb-2">Welcome Back</h2>
          <p className="text-on-surface-variant font-medium">Continue your academic journey.</p>
        </div>

        <button
          onClick={loginWithGoogle}
          disabled={loading}
          className="w-full bg-white text-black font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none mb-6"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          Sign in with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={loginUser} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 block">Email</label>
            <input
              type="email"
              className="w-full bg-surface-container-highest/50 border border-outline-variant focus:border-primary px-4 py-3 rounded-xl outline-none text-white transition-colors"
              placeholder="student@university.edu"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 block">Password</label>
            <input
              type="password"
              className="w-full bg-surface-container-highest/50 border border-outline-variant focus:border-primary px-4 py-3 rounded-xl outline-none text-white transition-colors"
              placeholder="••••••••"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold py-3 px-4 rounded-xl transition-all hover:shadow-[0_0_20px_var(--primary)] active:scale-[0.98] disabled:opacity-50 flex justify-center items-center mt-6"
          >
            {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : "Initialize Session"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-on-surface-variant">
          New to the observatory? <Link href="/register" className="text-primary font-bold hover:underline">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
}
