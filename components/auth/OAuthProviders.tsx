"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

// Simple custom SVG icons to match the premium feel, avoiding external heavy font packages if possible.
function GoogleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GithubIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function AppleIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" {...props}>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 22.1 182.2 7.8 245.2c-15.6 68.3 10.4 170.8 49.3 226.7 17.7 25.5 39.8 45.4 68.3 45.4 25.4 0 35.8-15.2 68.3-15.2 32.5 0 41.6 15.2 69.1 15.2 27.5 0 47.9-18.8 65.5-44.5 21.7-32 32.5-62.9 33.5-64.6-1.5-.7-43.1-16.1-43.1-64.5zm-59.5-207.2c19.3-23.7 32.2-56.5 28.7-89.5-28.4 1.2-63.5 19.3-83.6 42.6-17.1 19.8-31.9 53.6-27.7 85.8 32.4 2.5 63.3-15.2 82.6-38.9z"/>
    </svg>
  );
}

export function OAuthProviders() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const supabase = createClient();

  const handleOAuthLogin = async (provider: 'google' | 'github' | 'apple') => {
    try {
      setLoadingProvider(provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || `Failed to sign in with ${provider}`);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center gap-3 w-full">
        <button
          onClick={() => handleOAuthLogin('google')}
          disabled={!!loadingProvider}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/90 shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-all hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
        >
          {loadingProvider === 'google' ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <GoogleIcon className="h-5 w-5" />
          )}
          <span>Google</span>
        </button>

        <button
          onClick={() => handleOAuthLogin('github')}
          disabled={!!loadingProvider}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/90 shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-all hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
        >
          {loadingProvider === 'github' ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <GithubIcon className="h-5 w-5" />
          )}
          <span>GitHub</span>
        </button>

        <button
          onClick={() => handleOAuthLogin('apple')}
          disabled={!!loadingProvider}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/90 shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-all hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50"
        >
          {loadingProvider === 'apple' ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <AppleIcon className="h-5 w-5" />
          )}
          <span>Apple</span>
        </button>
      </div>
    </div>
  );
}
