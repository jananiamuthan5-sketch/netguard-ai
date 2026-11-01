import React from 'react';

/**
 * Reusable cybersecurity status badge with strict color semantics:
 * - Green ONLY for safe / normal status
 * - Red ONLY for threat / intrusion / offline status
 * - Amber for warning / in-progress
 * - Cyan / Slate for info / neutral
 */
export default function StatusBadge({
  status = 'neutral',
  label,
  showPulse = true,
  size = 'md',
  className = '',
}) {
  const styles = {
    safe: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    normal: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    threat: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
    danger: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
    intrusion: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
    offline: 'text-rose-400 bg-rose-500/10 border-rose-500/25',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    info: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
    neutral: 'text-slate-400 bg-slate-800/60 border-slate-700/60',
  };

  const dotColors = {
    safe: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
    success: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
    normal: 'bg-emerald-400 shadow-[0_0_8px_#34d399]',
    threat: 'bg-rose-400 shadow-[0_0_8px_#f43f5e]',
    danger: 'bg-rose-400 shadow-[0_0_8px_#f43f5e]',
    intrusion: 'bg-rose-400 shadow-[0_0_8px_#f43f5e]',
    offline: 'bg-rose-500',
    warning: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]',
    info: 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]',
    neutral: 'bg-slate-400',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-mono',
    md: 'text-xs px-2.5 py-1 font-mono',
    lg: 'text-sm px-3 py-1.5 font-sans',
  };

  const currentStyle = styles[status] || styles.neutral;
  const currentDot = dotColors[status] || dotColors.neutral;

  return (
    <span
      className={`inline-flex items-center space-x-1.5 rounded-full border transition-all ${currentStyle} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {showPulse && (
        <span
          className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentDot} ${
            status === 'warning' || status === 'threat' ? 'animate-pulse' : ''
          }`}
        />
      )}
      <span className="truncate">{label}</span>
    </span>
  );
}
