import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import PageTransition from "@/components/PageTransition";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import "./globals.css";

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

import { ThemeProvider } from "@/components/ThemeProvider";
import { UniversityProvider } from "@/components/providers/UniversityProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

import BackgroundEffects from "@/components/BackgroundEffects";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-background text-foreground custom-scrollbar selection:bg-primary-container selection:text-on-primary-container transition-colors duration-700">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <BackgroundEffects />
          <AuthProvider>
            <UniversityProvider>
            <CustomCursor />
            <Navbar />
            <ErrorBoundary>
              <PageTransition>
                {children}
              </PageTransition>
            </ErrorBoundary>
            <Footer />
            </UniversityProvider>
          </AuthProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: 'var(--surface-container-high)',
                color: 'var(--on-surface)',
                border: '1px solid var(--outline-variant)',
                borderRadius: '16px',
                backdropFilter: 'blur(12px)',
                padding: '14px 18px',
                fontSize: '14px',
                fontFamily: 'var(--font-body), Inter, sans-serif',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
              },
              success: {
                style: {
                  borderLeft: '4px solid #34d399',
                },
                iconTheme: {
                  primary: '#34d399',
                  secondary: 'var(--background)',
                },
              },
              error: {
                style: {
                  borderLeft: '4px solid #f87171',
                },
                iconTheme: {
                  primary: '#f87171',
                  secondary: 'var(--background)',
                },
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
