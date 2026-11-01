import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Construction } from 'lucide-react';
import { ROUTES } from '../utils/constants';

export default function RoutePlaceholder({ title, description, plannedPhase = 'Phase 2' }) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-slate-800 text-center space-y-6">
        <div className="inline-flex p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
          <Construction className="w-8 h-8 animate-pulse" />
        </div>
        
        <div className="space-y-2">
          <div className="inline-block px-2.5 py-1 text-xs font-mono font-medium text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-full mb-1">
            Planned for {plannedPhase}
          </div>
          <h2 className="text-2xl font-bold text-slate-100">{title}</h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-400 text-left space-y-2 font-mono">
          <div className="text-slate-300 font-semibold flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Architecture Readiness</span>
          </div>
          <p>• Backend endpoint stubbed and mapped</p>
          <p>• Route registered in React Router</p>
          <p>• Feature activation pending Phase 2 rollout</p>
        </div>

        <div>
          <Link
            to={ROUTES.HOME}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Landing Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
