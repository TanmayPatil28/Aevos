"use client";

import React from "react";
import { Zap, Database, Server, Lock, TestTube, Activity } from "lucide-react";

export default function EngineeringSignals() {
  const signals = [
    {
      id: "auth",
      name: "Authentication",
      description: "Implemented JWT/OAuth in 2 projects",
      icon: <Lock className="w-4 h-4 text-indigo-400" />,
      color: "border-indigo-500/20 bg-indigo-500/10",
      active: true,
    },
    {
      id: "api",
      name: "REST APIs",
      description: "Designed 3 custom backend APIs",
      icon: <Server className="w-4 h-4 text-blue-400" />,
      color: "border-blue-500/20 bg-blue-500/10",
      active: true,
    },
    {
      id: "db",
      name: "Database Design",
      description: "Relational schema in 'E-commerce API'",
      icon: <Database className="w-4 h-4 text-emerald-400" />,
      color: "border-emerald-500/20 bg-emerald-500/10",
      active: true,
    },
    {
      id: "test",
      name: "Testing",
      description: "No Jest/PyTest setups detected",
      icon: <TestTube className="w-4 h-4 text-slate-400" />,
      color: "border-slate-800 bg-slate-900/50",
      active: false,
    },
    {
      id: "opt",
      name: "Optimization",
      description: "Missing caching or performance tuning",
      icon: <Zap className="w-4 h-4 text-slate-400" />,
      color: "border-slate-800 bg-slate-900/50",
      active: false,
    },
  ];

  return (
    <div className="bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-700/50 p-6 h-full flex flex-col">
      <div className="mb-6 flex items-center gap-2">
        <Activity className="w-5 h-5 text-indigo-400" />
        <h3 className="text-xl font-bold text-white">Real-World Engineering Signals</h3>
      </div>
      
      <p className="text-slate-400 text-sm mb-6">
        Recruiters look for signals beyond CRUD apps. Here is what your code demonstrates.
      </p>

      <div className="flex-1 space-y-3 overflow-y-auto custom-scrollbar pr-2">
        {signals.map((signal) => (
          <div 
            key={signal.id} 
            className={`p-3 rounded-xl border flex items-center gap-4 transition-colors ${
              signal.active ? signal.color : "border-slate-800 bg-slate-950 opacity-60"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              signal.active ? signal.color : "bg-slate-900"
            }`}>
              {signal.icon}
            </div>
            <div>
              <h4 className={`text-sm font-semibold ${signal.active ? "text-slate-200" : "text-slate-500"}`}>
                {signal.name}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">{signal.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 border border-indigo-500/30 bg-indigo-500/10 rounded-xl relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-indigo-500/20 blur-xl rounded-full" />
        <p className="text-sm font-medium text-indigo-300 mb-1 relative z-10">System Verdict</p>
        <p className="text-base font-bold text-white relative z-10">
          "This profile demonstrates intermediate production engineering capability."
        </p>
      </div>
    </div>
  );
}
