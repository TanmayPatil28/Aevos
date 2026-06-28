"use client";

import { useState } from "react";
import { MessageSquarePlus } from "lucide-react";
import { FeedbackModal } from "./FeedbackModal";

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center p-4 bg-primary text-primary-foreground rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300"
        aria-label="Give Feedback"
      >
        <MessageSquarePlus className="w-6 h-6" />
      </button>

      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
