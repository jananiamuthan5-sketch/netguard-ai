import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../utils/constants';

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-panel rounded-2xl p-8 border border-slate-800 text-center space-y-4">
        <div className="inline-flex p-3 rounded-full bg-rose-500/10 text-rose-400">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100 font-mono">404 - Page Not Found</h2>
        <p className="text-xs text-slate-400">
          The requested network endpoint or view is not recognized in the routing table.
        </p>
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
