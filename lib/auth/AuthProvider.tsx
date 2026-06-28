"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/lib/auth/actions";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isOffline: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isOffline: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function SupabaseAuthProvider({ 
  children, 
  initialUser 
}: { 
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Only set user if it changes to avoid unnecessary re-renders
    if (initialUser?.id !== user?.id) {
      setUser(initialUser);
    }
  }, [initialUser, user?.id]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          setUser(session?.user ?? null);
          setIsOffline(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.refresh();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  const signOut = async () => {
    try {
      setIsLoading(true);
      await logoutAction();
      setIsOffline(false);
    } catch (error: any) {
      if (error.name === 'AbortError' || error.message?.includes('fetch')) {
        console.warn("[Auth] Network timeout during sign out.");
        setIsOffline(true);
      } else {
        console.error("Sign out error:", error);
      }
      // Force local sign out even if network fails
      setUser(null);
    } finally {
      setIsLoading(false);
      router.replace('/auth');
      router.refresh();
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isOffline, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
