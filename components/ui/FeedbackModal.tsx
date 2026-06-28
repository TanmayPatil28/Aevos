"use client";

import { useState } from "react";
import { Star, X } from "lucide-react";
import { submitFeedback } from "@/actions/feedback";
import { toast } from "sonner";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please provide a star rating.");
      return;
    }
    if (!message.trim()) {
      toast.error("Please provide some feedback.");
      return;
    }

    setIsSubmitting(true);
    const result = await submitFeedback(rating, message);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Thank you for your feedback!");
      onClose();
      // Reset form
      setRating(0);
      setMessage("");
    } else {
      toast.error(result.error || "Something went wrong.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#86868B] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-semibold text-white mb-2">We value your opinion</h2>
        <p className="text-[#86868B] text-sm mb-6">Let us know how we can make Aevos even better for you.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
                className="focus:outline-none transition-transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    star <= (hoverRating || rating)
                      ? "fill-yellow-500 text-yellow-500"
                      : "text-white/20"
                  } transition-colors`}
                />
              </button>
            ))}
          </div>

          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What's on your mind? Have a feature request?"
            className="w-full h-32 bg-[#111] border border-white/10 rounded-xl p-4 text-white placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-gray-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      </div>
    </div>
  );
}
