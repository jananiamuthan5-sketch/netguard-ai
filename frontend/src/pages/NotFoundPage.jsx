import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Shield } from 'lucide-react';
import { ROUTES } from '../utils/constants';

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-slate-800 text-center space-y-5">
        <div className="inline-flex p-3 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 font-mono">
            404 — Route Not Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            The requested network view is not registered in the application routing table.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
          <Link
            to={ROUTES.DASHBOARD}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-semibold font-mono transition-all"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Open Dashboard</span>
          </Link>

          <Link
            to={ROUTES.HOME}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Landing Screen</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
