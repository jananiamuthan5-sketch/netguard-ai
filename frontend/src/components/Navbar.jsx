import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, Activity, RefreshCw } from 'lucide-react';
import { ROUTES } from '../utils/constants';
import useApiHealth from '../hooks/useApiHealth';

export default function Navbar() {
  const location = useLocation();
  const { isConnected, loading, refresh } = useApiHealth();

  const navItems = [
    { name: 'Home', path: ROUTES.HOME },
    { name: 'Dashboard', path: ROUTES.DASHBOARD, tag: 'Phase 2' },
    { name: 'Analyze Traffic', path: ROUTES.ANALYZE, tag: 'Phase 2' },
    { name: 'Results History', path: ROUTES.RESULTS, tag: 'Phase 2' },
    { name: 'Analytics', path: ROUTES.ANALYTICS, tag: 'Phase 2' },
    { name: 'Model Performance', path: ROUTES.MODEL_PERFORMANCE, tag: 'Phase 2' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={ROUTES.HOME} className="flex items-center space-x-3 group">
          <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 group-hover:border-cyan-400/60 transition-all">
            <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-105 transition-transform" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-wider text-slate-100 font-mono">NETGUARD</span>
              <span className="px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">AI</span>
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span>{item.name}</span>
                {item.tag && (
                  <span className="text-[9px] px-1 py-0.2 bg-slate-800 text-slate-400 rounded border border-slate-700">
                    {item.tag}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Live Backend Health Indicator */}
        <div className="flex items-center space-x-3">
          <button
            onClick={refresh}
            title="Click to re-check API health"
            className="flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-mono border transition-all glass-panel hover:bg-slate-800/60"
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                loading
                  ? 'bg-amber-400'
                  : isConnected
                  ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                  : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
              }`}
            />
            <span className="text-slate-300">
              {loading ? 'Checking API...' : isConnected ? 'API Online' : 'API Offline'}
            </span>
            <RefreshCw className={`w-3 h-3 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
