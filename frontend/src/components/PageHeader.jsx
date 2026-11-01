import React from 'react';

export default function PageHeader({
  title,
  description,
  badge,
  actions,
  className = '',
}) {
  return (
    <div className={`mb-6 sm:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/80 ${className}`}>
      <div className="space-y-1.5">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 font-sans">
            {title}
          </h1>
          {badge && <div>{badge}</div>}
        </div>
        {description && (
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center space-x-3 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
