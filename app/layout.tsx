import type { Metadata } from "next";
import { Toaster } from "sonner";
import NavbarServer from "@/components/NavbarServer";
import Footer from "@/components/Footer";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
const SmartTimetableController = dynamic(() => import("@/components/dynamic-island/SmartTimetableController"), { ssr: false });
const BunkCalculatorController = dynamic(() => import("@/components/dynamic-island/BunkCalculatorController"), { ssr: false });
const InterventionAlertBridge = dynamic(() => import("@/components/dynamic-island/InterventionAlertBridge"), { ssr: false });

import NextTopLoader from "nextjs-toploader";
import dynamic from "next/dynamic";
const CustomCursor = dynamic(() => import("@/components/CustomCursor"), { ssr: false });
import { Inter } from "next/font/google";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { SupabaseAuthProvider } from "@/lib/auth/AuthProvider";
import SkipToContent from "@/components/ui/SkipToContent";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "GradeFlow | B.Tech Student Intelligence Operating System",
    template: "%s | GradeFlow"
  },
  description: "Deterministic academic simulation, regulation-aware planning, and placement eligibility tracking for B.Tech students.",
  keywords: ["CGPA Calculator", "Academic Simulation", "B.Tech Planner", "Recruiter Eligibility", "Placement Predictor", "SPPU", "VTU", "JNTUH"],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gradeflow.app",
    title: "GradeFlow | B.Tech Student Intelligence Operating System",
    description: "Deterministic academic simulation, regulation-aware planning, and placement eligibility tracking for B.Tech students.",
    siteName: "GradeFlow",
  },
  twitter: {
    card: "summary_large_image",
    title: "GradeFlow | B.Tech Student OS",
    description: "Deterministic academic simulation & placement tracking.",
  },
};

import { UniversityProvider } from "@/components/providers/UniversityProvider";
import { AcademicStateProvider } from "@/contexts/AcademicContext";
import { AcademicHydrationBoundary } from "@/components/providers/AcademicHydrationBoundary";
const DiagnosticOverlay = dynamic(() => import("@/components/layout/DiagnosticOverlay"), { ssr: false });
const BackgroundEffects = dynamic(() => import("@/components/BackgroundEffects"), { ssr: false });
import IslandTestControls from "@/components/dynamic-island/IslandTestControls";
const ContextualIslandController = dynamic(() => import("@/components/dynamic-island/ContextualIslandController"), { ssr: false });
import { BackgroundSyncWorker } from "@/components/providers/BackgroundSyncWorker";
import { LenisProvider } from "@/components/providers/LenisProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-body bg-background text-foreground custom-scrollbar selection:bg-primary-container selection:text-on-primary-container`}>
          <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
          <BackgroundEffects />
          <UniversityProvider>
            <NextTopLoader
              color="#3b82f6"
              initialPosition={0.2}
              crawlSpeed={150}
              height={3}
              crawl={true}
              showSpinner={false}
              easing="cubic-bezier(0.16, 1, 0.3, 1)"
              speed={150}
              shadow="0 0 15px #3b82f6,0 0 5px #3b82f6"
            />
            <CustomCursor />
            <SkipToContent />
            <NuqsAdapter>
              <SupabaseAuthProvider initialUser={null}>
                <ErrorBoundary>
                  <AcademicStateProvider>
                    <AcademicHydrationBoundary>
                      <LenisProvider>
                        <BackgroundSyncWorker />
                        <NavbarServer />
                        <main id="main-content" tabIndex={-1} className="outline-none">
                          {children}
                        </main>
                        <Footer />
                      </LenisProvider>
                    </AcademicHydrationBoundary>
                  </AcademicStateProvider>
                </ErrorBoundary>
              </SupabaseAuthProvider>
            </NuqsAdapter>
            </UniversityProvider>
          <DiagnosticOverlay />
          <Toaster 
            position="bottom-center"
            theme="dark"
            toastOptions={{
              className: 'dynamic-pill-toast'
            }}
          />
          <ContextualIslandController />
          <SmartTimetableController />
          <BunkCalculatorController />
          <InterventionAlertBridge />
          {process.env.NODE_ENV === "development" && <IslandTestControls />}
      </body>
    </html>
  );
}
