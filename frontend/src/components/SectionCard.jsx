import React from 'react';

export default function SectionCard({
  title,
  description,
  headerAction,
  icon: Icon,
  children,
  className = '',
}) {
  return (
    <div className={`glass-panel rounded-xl border border-slate-800/80 p-5 sm:p-6 ${className}`}>
      {(title || headerAction) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-800/80 gap-3">
          <div>
            <div className="flex items-center space-x-2.5">
              {Icon && (
                <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Icon className="w-4 h-4" />
                </div>
              )}
              {title && (
                <h3 className="text-base sm:text-lg font-semibold text-slate-100 font-sans tracking-tight">
                  {title}
                </h3>
              )}
            </div>
            {description && (
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {description}
              </p>
            )}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
}
