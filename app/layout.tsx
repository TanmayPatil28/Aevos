import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import dynamic from "next/dynamic";

const CustomCursor = dynamic(() => import("@/components/CustomCursor"), { ssr: false });
import { Inter } from "next/font/google";
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
import { AuthProvider } from "@/components/providers/AuthProvider";
import { AcademicStateProvider } from "@/contexts/AcademicContext";
import { AcademicHydrationBoundary } from "@/components/providers/AcademicHydrationBoundary";
const DiagnosticOverlay = dynamic(() => import("@/components/layout/DiagnosticOverlay"), { ssr: false });
const BackgroundEffects = dynamic(() => import("@/components/BackgroundEffects"), { ssr: false });
import { OSModeProvider } from "@/contexts/OSModeContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} font-body bg-background text-foreground custom-scrollbar selection:bg-primary-container selection:text-on-primary-container`}>
          <BackgroundEffects />
          <AuthProvider>
            <UniversityProvider>
            <CustomCursor />
            <ErrorBoundary>
              <AcademicStateProvider>
                <AcademicHydrationBoundary>
                  <OSModeProvider>
                    <Navbar />
                    {children}
                    <Footer />
                  </OSModeProvider>
                </AcademicHydrationBoundary>
              </AcademicStateProvider>
            </ErrorBoundary>
            </UniversityProvider>
          </AuthProvider>
          <DiagnosticOverlay />
          <Toaster 
            position="bottom-center"
            toastOptions={{
              duration: 3500,
              style: {
                background: 'rgba(20, 20, 20, 0.85)',
                color: '#f5f5f5',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '1rem',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                padding: '16px 20px',
                fontSize: '14px',
                fontWeight: '500',
                fontFamily: 'var(--font-body), Inter, system-ui, sans-serif',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.05) inset',
                maxWidth: '420px',
              },
              success: {
                style: {
                  borderLeft: '3px solid #34d399',
                  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4), 0 0 20px rgba(52, 211, 153, 0.1)',
                },
                iconTheme: {
                  primary: '#34d399',
                  secondary: '#111',
                },
              },
              error: {
                style: {
                  borderLeft: '3px solid #f87171',
                  boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4), 0 0 20px rgba(248, 113, 113, 0.1)',
                },
                iconTheme: {
                  primary: '#f87171',
                  secondary: '#111',
                },
              },
            }}
          />
      </body>
    </html>
  );
}
