import React from 'react';
import StatusBadge from './StatusBadge';

export default function MetricCard({
  title,
  value = '--',
  icon: Icon,
  subtitle,
  badgeText,
  badgeStatus = 'neutral',
  status = 'neutral',
  emptyMessage = 'No data available',
  className = '',
}) {
  const isValueEmpty = value === '--' || value === null || value === undefined;

  const borderAccents = {
    neutral: 'border-slate-800/80 hover:border-slate-700',
    info: 'border-cyan-500/30 hover:border-cyan-500/50',
    safe: 'border-emerald-500/30 hover:border-emerald-500/50',
    threat: 'border-rose-500/30 hover:border-rose-500/50',
    warning: 'border-amber-500/30 hover:border-amber-500/50',
  };

  const iconColors = {
    neutral: 'text-slate-400 bg-slate-800/50 border-slate-700/60',
    info: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    safe: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    threat: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  };

  return (
    <div
      className={`glass-panel rounded-xl p-5 border transition-all duration-200 hover:-translate-y-0.5 ${
        borderAccents[status] || borderAccents.neutral
      } ${className}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 tracking-wide uppercase font-mono">
          {title}
        </span>
        {Icon && (
          <div className={`p-2 rounded-lg border shrink-0 ${iconColors[status] || iconColors.neutral}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2 my-1">
        <span className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight">
          {value}
        </span>
        {badgeText && (
          <StatusBadge status={badgeStatus} label={badgeText} size="sm" />
        )}
      </div>

      <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
        <span>{subtitle || (isValueEmpty ? emptyMessage : '')}</span>
      </div>
    </div>
  );
}
