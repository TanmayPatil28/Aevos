"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import GlowButton from "../GlowButton";
import GlassCard from "../GlassCard";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in GradeFlow Boundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#000000] p-6 text-white selection:bg-indigo-500/30 selection:text-indigo-200">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#090D16] to-[#090D16] pointer-events-none" />
          
          <GlassCard className="max-w-md w-full p-8 text-center border-red-500/20 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-red-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="inline-flex p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-400 mb-6 animate-pulse">
              <AlertTriangle size={32} />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
              System Anomaly Detected
            </h1>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              GradeFlow encountered a runtime calculation anomaly. This event has been logged. Let&apos;s get you back on track.
            </p>

            {this.state.error && (
              <div className="bg-black/40 border border-white/5 rounded-lg p-3 text-left font-mono text-xs text-red-300 max-h-32 overflow-auto mb-6 select-all scrollbar-thin scrollbar-thumb-white/10">
                {this.state.error.name}: {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <GlowButton
                onClick={this.handleReset}
                variant="primary"
                className="w-full sm:w-auto"
              >
                <RefreshCw size={16} className="mr-2 animate-spin-slow" />
                Recover Session
              </GlowButton>
              <GlowButton
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.location.href = "/";
                  }
                }}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                <Home size={16} className="mr-2" />
                Go Home
              </GlowButton>
            </div>
          </GlassCard>
        </div>
      );
    }

    return this.props.children;
  }
}
