"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const registerUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.name || !data.email || !data.password) {
      toast.error("Please fill in all fields.");
      return;
    }

    setLoading(true);
    
    // Register the user with Supabase Auth.
    // Since email confirmations are disabled for MVP, this will automatically
    // sign them in. The PostgreSQL trigger will sync their account to Prisma.
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
        }
      }
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account initialized! Welcome to the Nebula.");
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
          <h2 className="text-3xl font-headline font-black text-white mb-2">Join the Elite 1%</h2>
          <p className="text-on-surface-variant font-medium">Create your academic profile.</p>
        </div>

        <form onSubmit={registerUser} className="space-y-4">
          <div>
            <label htmlFor="register-name" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 block">Full Name</label>
            <input
              id="register-name"
              type="text"
              className="w-full bg-surface-container-highest/50 border border-outline-variant focus:border-secondary px-4 py-3 rounded-xl outline-none text-white transition-colors"
              placeholder="John Doe"
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              autoComplete="name"
              required
            />
          </div>
          <div>
            <label htmlFor="register-email" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 block">Email</label>
            <input
              id="register-email"
              type="email"
              className="w-full bg-surface-container-highest/50 border border-outline-variant focus:border-secondary px-4 py-3 rounded-xl outline-none text-white transition-colors"
              placeholder="student@university.edu"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="register-password" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1 block">Secure Password</label>
            <input
              id="register-password"
              type="password"
              className="w-full bg-surface-container-highest/50 border border-outline-variant focus:border-secondary px-4 py-3 rounded-xl outline-none text-white transition-colors"
              placeholder="••••••••"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              autoComplete="new-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary hover:bg-secondary/90 text-on-secondary font-bold py-3 px-4 rounded-xl transition-all hover:shadow-[0_0_20px_var(--secondary)] active:scale-[0.98] disabled:opacity-50 flex justify-center items-center mt-6"
          >
            {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : "Launch Profile"}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-on-surface-variant">
          Already an operator? <Link href="/login" className="text-secondary font-bold hover:underline">Access terminal</Link>
        </p>
      </motion.div>
    </div>
  );
}
