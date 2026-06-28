"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Drawer } from "vaul";
import { X, Search } from "lucide-react";
import { cn } from "@/lib/cn";
import UniversitySelector from "@/components/UniversitySelector";
import { useUSMStore, WorkspaceState } from "@/stores/usmStore";
import { OS_MODES } from "@/components/OSModeSwitcher";
import { createClient } from "@/lib/supabase/client";
import { useNavbarNavigation } from "@/lib/hooks/useNavbarNavigation";
import { ICONS } from "@/lib/config/navigation";
import { useAuth } from "@/lib/auth/AuthProvider";

function maskEmail(email: string) {
  if (!email || !email.includes("@")) return "";
  const [localPart, domain] = email.split("@");
  if (localPart.length <= 2) return `${localPart[0]}***@${domain}`;
  return `${localPart[0]}***${localPart[localPart.length - 1]}@${domain}`;
}

interface NavbarMobileDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onOpenJarvis?: () => void;
  mainLinks: any[];
  intelligenceModules: any[];
}

export default function NavbarMobileDrawer({ isOpen, setIsOpen, onOpenJarvis, mainLinks, intelligenceModules }: NavbarMobileDrawerProps) {
  const router = useRouter();
  const mode = useUSMStore(state => state.workspaceUi.mode);
  const setWorkspaceMode = useUSMStore(state => state.setWorkspaceMode);
  const { pathname, isLinkActive } = useNavbarNavigation();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  return (
    <Drawer.Root direction="right" open={isOpen} onOpenChange={setIsOpen}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-[#000000]/80 z-[100000]" />
        <Drawer.Content
          className="fixed bottom-0 right-0 top-0 w-navbar-mobile h-[100dvh] bg-[#1D1D1F] border-l border-white/20 z-[100001] flex flex-col focus:outline-none"
          aria-label="Mobile Navigation Drawer"
        >
          <div className="p-8 flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8 shrink-0">
              <Drawer.Title className="font-headline font-black text-2xl text-white tracking-widest">GF.OS</Drawer.Title>
              <Drawer.Close aria-label="Close navigation menu" className="w-11 h-11 flex items-center justify-center rounded-full bg-white/5 text-white/60">
                <X size={26} strokeWidth={3} />
              </Drawer.Close>
            </div>

            <button 
              onClick={() => { setIsOpen(false); onOpenJarvis?.(); }}
              className="flex items-center gap-3 w-full shrink-0 bg-white/5 hover:bg-white/10 text-white/50 border border-white/10 rounded-2xl px-5 py-4 mb-8 transition-colors text-left"
            >
              <Search size={20} strokeWidth={2.5} />
              <span className="font-medium">Search / Ask JARVIS</span>
            </button>

            {/* Auth Section */}
            {user ? (
              <div className="flex items-center justify-between shrink-0 mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex flex-col">
                  <span className="text-[14px] font-bold text-white">Student Account</span>
                  <span className="text-[11px] text-white/50">{maskEmail(user.email ?? "")}</span>
                </div>
                <button onClick={handleSignOut} className="text-[12px] font-bold text-red-400 hover:text-red-300 transition-colors bg-red-500/10 px-3 py-1.5 rounded-full">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mb-6 flex gap-2 shrink-0">
                <Link href="/auth" onClick={() => setIsOpen(false)} className="flex-1 h-11 flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all">Log In</Link>
                <Link href="/signup" onClick={() => setIsOpen(false)} className="flex-1 h-11 flex items-center justify-center bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)]">Sign Up</Link>
              </div>
            )}

            {/* Mobile University Selector */}
            <div className="shrink-0">
              <UniversitySelector variant="mobile" />
            </div>

            {/* Mobile OS Mode Switcher */}
            <div className="mt-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/30 block mb-3 ml-1">OS Mode</span>
              <div className="grid grid-cols-2 gap-2">
                {OS_MODES.slice(0, 3).map((m) => {
                  const isActive = mode === m.id;
                  const Icon = m.icon;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                         setWorkspaceMode(m.id as WorkspaceState["mode"]);
                         setIsOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-xl border transition-all duration-300",
                        isActive 
                          ? cn("border-white/15", m.bg, m.glow)
                          : "border-white/5 bg-white/[0.02] hover:bg-white/5"
                      )}
                    >
                      <Icon size={14} className={isActive ? m.color : "text-white/40"} />
                      <span className={cn("text-[12px] font-bold tracking-tight", isActive ? "text-white" : "text-white/60")}>
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <nav aria-label="Mobile Main Navigation" className="flex flex-col gap-2 flex-1 mt-6">
              <ul className="flex flex-col gap-2">
              {mainLinks.map((link, i) => {
                const Icon = ICONS[link.iconName] || Search;
                return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={(e) => {
                      if (pathname === link.href) e.preventDefault();
                      setIsOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-2xl text-[17px] font-black transition-all",
                      isLinkActive(link.href) ? "bg-blue-500/10 text-blue-500" : "text-white/40 hover:text-white"
                    )}
                  >
                    <Icon size={22} strokeWidth={3} />
                    {link.name}
                  </Link>
                </li>
                );
              })}
              </ul>

              <div className="h-[1px] bg-white/5 my-6 shrink-0" />

              <nav aria-label="Mobile Intelligence Modules" className="pb-20 pr-2">
                <ul className="flex flex-col">
                {intelligenceModules.map((module, i) => (
                  <li key={module.category} className="mb-6">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-white/30 mb-3 ml-2">{module.category}</h4>
                    <ul className="flex flex-col gap-1">
                      {module.items.map((tool: any) => {
                        const ToolIcon = ICONS[tool.iconName] || Search;
                        return (
                        <li key={tool.href}>
                          <Link 
                            href={tool.href}
                            prefetch={false}
                            onMouseEnter={() => router.prefetch(tool.href)}
                            onClick={(e) => {
                              if (pathname === tool.href) e.preventDefault();
                              setIsOpen(false);
                            }}
                            className="w-full text-left flex items-center gap-4 p-3 rounded-2xl group active:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 outline-none"
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-white/50 transition-all shadow-inner",
                              module.accent.hoverIcon
                            )}>
                              <ToolIcon size={18} strokeWidth={2.5} />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[14px] font-bold text-white/90 group-hover:text-white transition-colors">{tool.name}</span>
                              <span className="text-[11px] font-medium text-white/40 group-hover:text-white/60 transition-colors leading-tight">{tool.desc}</span>
                            </div>
                          </Link>
                        </li>
                        );
                      })}
                    </ul>
                  </li>
                ))}
                </ul>
              </nav>
            </nav>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
