"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const router = useRouter();
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const registerUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name || !data.email || !data.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Account initialized. Please log in.");
        router.push("/login");
      } else {
        const result = await response.json();
        toast.error(result.error || "Failed to register.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-[120px] pointer-events-none opacity-50" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 glass-card rounded-[2rem] border border-white/10 shadow-[0_20px_80px_rgba(0,0,0,0.6)] relative z-10 mx-4"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-headline font-black text-white mb-2">Join the Elite 1%</h2>
          <p className="text-on-surface-variant font-medium">Create your academic profile.</p>
        </div>

        <form onSubmit={registerUser} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 block">Full Name</label>
            <input
              type="text"
              className="w-full bg-surface-container-highest/50 border border-outline-variant focus:border-secondary px-4 py-3 rounded-xl outline-none text-white transition-colors"
              placeholder="John Doe"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 block">Email</label>
            <input
              type="email"
              className="w-full bg-surface-container-highest/50 border border-outline-variant focus:border-secondary px-4 py-3 rounded-xl outline-none text-white transition-colors"
              placeholder="student@university.edu"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 block">Secure Password</label>
            <input
              type="password"
              className="w-full bg-surface-container-highest/50 border border-outline-variant focus:border-secondary px-4 py-3 rounded-xl outline-none text-white transition-colors"
              placeholder="••••••••"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary/90 text-on-secondary font-bold py-3 px-4 rounded-xl transition-all hover:shadow-[0_0_20px_var(--secondary)] active:scale-[0.98] disabled:opacity-50 flex justify-center items-center mt-6"
          >
            {loading ? <span className="material-symbols-outlined animate-spin">refresh</span> : "Launch Profile"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-on-surface-variant">
          Already an operator? <Link href="/login" className="text-secondary font-bold hover:underline">Access terminal</Link>
        </p>
      </motion.div>
    </div>
  );
}
