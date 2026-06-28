"use client";

import { useState, useEffect } from "react";
import { joinWaitlist, getWaitlistCount } from "@/actions/waitlist";
import { toast } from "sonner";
import { ArrowRight, Loader2 } from "lucide-react";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    getWaitlistCount().then((res) => {
      if (res.success && res.count) {
        setCount(res.count);
      }
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    const result = await joinWaitlist(email);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("You're on the list! We'll be in touch.");
      setHasJoined(true);
      if (count !== null) setCount(count + 1);
    } else {
      toast.error(result.error || "Something went wrong.");
    }
  };

  if (hasJoined) {
    return (
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-6 py-4 rounded-2xl font-medium text-lg">
          🎉 You are on the waitlist! Keep an eye on your inbox.
        </div>
        {count !== null && (
          <div className="text-[#86868B] font-medium mt-2">
            Joined {count.toLocaleString()} others waiting for early access.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6 mt-8 w-full max-w-md mx-auto relative z-20">
      <form onSubmit={handleSubmit} className="flex w-full relative">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="w-full bg-[#111] border border-white/20 rounded-full py-4 pl-6 pr-32 text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="absolute right-2 top-2 bottom-2 bg-white text-black font-semibold rounded-full px-6 flex items-center gap-2 hover:bg-gray-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Join Waitlist"}
        </button>
      </form>
      
      {count !== null && (
        <div className="text-[#86868B] font-medium flex items-center gap-2 animate-in fade-in zoom-in duration-500">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          Join {count.toLocaleString()} others on the waitlist
        </div>
      )}
    </div>
  );
}
