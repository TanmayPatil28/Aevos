import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CustomCursor from "@/components/CustomCursor";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700", "800"], 
  variable: "--font-headline" 
});

const inter = Inter({ 
  subsets: ["latin"], 
  weight: ["300", "400", "500", "600"], 
  variable: "--font-body" 
});

export const metadata: Metadata = {
  title: "GradeFlow | The Academic Observatory",
  description: "Premium CGPA calculator and planner for B.Tech students.",
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
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className={`${plusJakartaSans.variable} ${inter.variable} font-body bg-background text-foreground custom-scrollbar selection:bg-primary-container selection:text-on-primary-container transition-colors duration-700`}>
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
            <PageTransition>
              {children}
            </PageTransition>
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
