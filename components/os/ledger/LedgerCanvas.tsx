"use client";

import { useDomainStore } from "@/stores/os/domainStore";
import { useUIStore } from "@/stores/os/uiStore";
import { useEffect } from "react";
import Link from "next/link";
import TermSection from "./TermSection";
import { COPY } from "@/lib/os/constants/copy";

import { PageHero } from "@/components/ui/PageHero";

export default function LedgerCanvas() {
  const { terms } = useDomainStore();
  const { setContextBar, clearContextBar } = useUIStore();

  // Inject dynamic actions to the Context Bar
  useEffect(() => {
    setContextBar(COPY.LEDGER.TITLE, [
      {
        id: "add_term",
        label: "Add Semester",
        icon: "add",
        primary: true,
        onClick: () => {
          const newTerm = {
            id: `term_${Date.now()}`,
            name: `Semester ${terms.length + 1}`,
            order: terms.length + 1,
            status: "PLANNED" as const
          };
          useDomainStore.getState().addTerm(newTerm);
        }
      }
    ]);

    return () => clearContextBar();
  }, [setContextBar, clearContextBar]);

  // Sort terms by order
  const sortedTerms = [...terms].sort((a, b) => b.order - a.order);

  return (
    <div className="w-full flex flex-col gap-os-section pt-24 pb-32 max-w-5xl mx-auto animate-fade-in ease-os-smooth duration-700 px-6">
      
      <PageHero 
        headline={<>Track every mark.<br/>Your immutable academic record.</>}
        description="A comprehensive vault of all your semester records, subject grades, and credit history. Easily review past performance and maintain a granular view of your academic progression over time."
      />
      {sortedTerms.length === 0 ? (
        <div className="flex flex-col items-center justify-center pt-20 pb-20 px-4 text-center">
          <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-4xl text-slate-500">table_chart</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-200 mb-2">{COPY.LEDGER.EMPTY_STATE_TITLE}</h2>
          <p className="text-slate-400 max-w-md mb-8">{COPY.LEDGER.EMPTY_STATE_SUB}</p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/records"
              className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              {COPY.LEDGER.ACTION_IMPORT}
            </Link>
            <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors">
              {COPY.LEDGER.ACTION_MANUAL}
            </button>
          </div>
        </div>
      ) : (
        <>
          {sortedTerms.map(term => (
            <TermSection key={term.id} term={term} />
          ))}

          {/* Workflow Continuity (Rule 2) */}
          <div className="w-full flex justify-end mt-4 animate-fade-in delay-300 fill-mode-both">
            <Link 
              href="/forecasting"
              className="group flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors bg-slate-800/20 hover:bg-indigo-500/10 px-4 py-2 rounded-full border border-slate-700/50 hover:border-indigo-500/30"
            >
              {COPY.LEDGER.CONTINUITY_PROMPT}
            </Link>
          </div>
        </>
      )}

    </div>
  );
}
