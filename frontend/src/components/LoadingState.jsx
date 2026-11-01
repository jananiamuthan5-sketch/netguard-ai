import React from 'react';
import { Loader2 } from 'lucide-react';

export default function LoadingState({
  message = 'Loading data...',
  description = 'Connecting to NetGuard services...',
  compact = false,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-xl border border-slate-800 bg-slate-900/30 ${
        compact ? 'p-6' : 'p-12'
      } ${className}`}
    >
      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-3 animate-spin">
        <Loader2 className={compact ? 'w-5 h-5' : 'w-7 h-7'} />
      </div>
      <p className="text-sm font-medium text-slate-200">{message}</p>
      {description && (
        <p className="text-xs text-slate-400 mt-1 max-w-sm">{description}</p>
      )}
    </div>
  );
}
