"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

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
          <svg aria-hidden="true" viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M21.805 12.23c0-.68-.061-1.334-.174-1.962H12v3.714h5.498a4.703 4.703 0 0 1-2.04 3.086v2.56h3.3c1.931-1.779 3.047-4.4 3.047-7.398Z" fill="#4285F4" />
            <path d="M12 22c2.76 0 5.075-.915 6.766-2.472l-3.3-2.56c-.916.614-2.089.977-3.466.977-2.66 0-4.914-1.796-5.72-4.208H2.87v2.64A9.998 9.998 0 0 0 12 22Z" fill="#34A853" />
            <path d="M6.28 13.737A5.99 5.99 0 0 1 5.96 12c0-.604.109-1.19.32-1.737v-2.64H2.87A9.998 9.998 0 0 0 2 12c0 1.611.386 3.132 1.07 4.377l3.21-2.64Z" fill="#FBBC04" />
            <path d="M12 6.055c1.5 0 2.847.516 3.907 1.53l2.93-2.93C17.07 2.99 14.756 2 12 2A9.998 9.998 0 0 0 2.87 7.623l3.41 2.64c.806-2.412 3.06-4.208 5.72-4.208Z" fill="#EA4335" />
          </svg>
          Sign in with Google
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">OR</span>
          <div className="flex-1 h-px bg-white/10" />
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
