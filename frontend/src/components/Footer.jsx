import React from 'react';
import { ShieldAlert, Terminal, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-cyan-500" />
          <span className="font-semibold text-slate-400">NetGuard AI</span>
          <span>—</span>
          <span>AI-Powered Network Intrusion Detection System</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-slate-400" />
            <span>FastAPI + SQLite</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Terminal className="w-3.5 h-3.5 text-slate-400" />
            <span>Vite + React</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">Phase 1 Foundation</span>
        </div>
      </div>
    </footer>
  );
}
