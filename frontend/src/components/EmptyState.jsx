import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function EmptyState({
  icon: Icon = ShieldAlert,
  title = 'No data available',
  description = 'Data will appear here once network traffic is uploaded and analyzed.',
  actionText,
  actionTo,
  onAction,
  secondaryNote,
  className = '',
  compact = false,
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/30 backdrop-blur-sm ${
        compact ? 'p-6' : 'p-8 sm:p-12'
      } ${className}`}
    >
      <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-4 shadow-[0_0_20px_rgba(0,242,254,0.1)]">
        <Icon className={compact ? 'w-6 h-6' : 'w-8 h-8'} />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-slate-200 mb-1.5 font-sans">
        {title}
      </h3>

      <p className="text-xs sm:text-sm text-slate-400 max-w-md mb-5 leading-relaxed">
        {description}
      </p>

      {secondaryNote && (
        <div className="mb-4 inline-block px-2.5 py-1 text-[11px] font-mono text-slate-400 bg-slate-800/80 rounded border border-slate-700/60">
          {secondaryNote}
        </div>
      )}

      {actionText && actionTo && (
        <Link
          to={actionTo}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(0,242,254,0.25)] hover:shadow-[0_0_25px_rgba(0,242,254,0.4)]"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}

      {actionText && !actionTo && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(0,242,254,0.25)]"
        >
          <span>{actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
