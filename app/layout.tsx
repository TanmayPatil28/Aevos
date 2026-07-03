import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";

import NextTopLoader from "nextjs-toploader";
import dynamic from "next/dynamic";
const CustomCursor = dynamic(() => import("@/components/CustomCursor"), { ssr: false });
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { SupabaseAuthProvider } from "@/lib/auth/AuthProvider";
import SkipToContent from "@/components/ui/SkipToContent";
import { createClient } from "@/lib/supabase/server";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-plus-jakarta-sans", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "Aevos",
    template: "%s | Aevos"
  },
  description: "Human Intelligence Infrastructure.",
  keywords: ["Aevos", "Human Intelligence", "Infrastructure", "Operating System"],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' }
    ],
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aevos.app",
    title: "Aevos",
    description: "Human Intelligence Infrastructure.",
    siteName: "Aevos",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aevos",
    description: "Human Intelligence Infrastructure.",
  },
};

import { UniversityProvider } from "@/components/providers/UniversityProvider";
import { AcademicHydrationBoundary } from "@/components/providers/AcademicHydrationBoundary";
const DiagnosticOverlay = dynamic(() => import("@/components/layout/DiagnosticOverlay"), { ssr: false });
const BackgroundEffects = dynamic(() => import("@/components/BackgroundEffects"), { ssr: false });
import { BackgroundSyncWorker } from "@/components/providers/BackgroundSyncWorker";
import { LenisProvider } from "@/components/providers/LenisProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { FeedbackButton } from "@/components/ui/FeedbackButton";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scrollbar-hide" suppressHydrationWarning>
      <body className={`${inter.variable} ${plusJakartaSans.variable} font-sans bg-background text-foreground scrollbar-hide selection:bg-primary-container selection:text-on-primary-container`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
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
            {/* <CustomCursor /> */}
            <SkipToContent />
            <NuqsAdapter>
              <SupabaseAuthProvider initialUser={null}>
                <ErrorBoundary>
                    <AcademicHydrationBoundary>
                      <LenisProvider>
                        <BackgroundSyncWorker />
                        <div className="flex w-full min-h-[100dvh]">
                          <main id="main-content" tabIndex={-1} className="outline-none flex-1 flex flex-col w-full">
                            {children}
                          </main>
                        </div>
                      </LenisProvider>
                    </AcademicHydrationBoundary>
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
          <FeedbackButton />
        </ThemeProvider>
      </body>
    </html>
  );
}
