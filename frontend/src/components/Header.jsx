import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, ShieldAlert, RefreshCw, Server, Activity } from 'lucide-react';
import { ROUTES } from '../utils/constants';
import useApiHealth from '../hooks/useApiHealth';
import StatusBadge from './StatusBadge';

export default function Header({ onMenuToggle = () => {} }) {
  const location = useLocation();
  const { isConnected, statusText, loading, refresh } = useApiHealth();

  // Page title and description lookup based on current pathname
  const pageMetadata = {
    [ROUTES.DASHBOARD]: {
      title: 'Security Overview',
      description: 'Monitor and analyze network traffic using AI-powered intrusion detection.',
    },
    [ROUTES.ANALYZE]: {
      title: 'Analyze Network Traffic',
      description: 'Upload network traffic data for AI-powered intrusion analysis.',
    },
    [ROUTES.RESULTS]: {
      title: 'Detection Results',
      description: 'Review the results of completed network traffic analyses.',
    },
    [ROUTES.ANALYTICS]: {
      title: 'Security Analytics',
      description: 'Explore network traffic and intrusion detection trends.',
    },
    [ROUTES.MODEL_PERFORMANCE]: {
      title: 'AI Model Performance',
      description: 'Review the performance of the Machine Learning intrusion detection model.',
    },
    [ROUTES.HOME]: {
      title: 'System Overview',
      description: 'AI-Powered Network Intrusion Detection System foundation.',
    },
  };

  const currentMeta = pageMetadata[location.pathname] || {
    title: 'NetGuard AI',
    description: 'AI-Powered Network Intrusion Detection System',
  };

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile hamburger menu & dynamic Page Title */}
      <div className="flex items-center space-x-3.5">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 focus:outline-none"
          aria-label="Open sidebar navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-100 font-sans tracking-tight">
              {currentMeta.title}
            </h2>
            <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono uppercase bg-slate-800/80 text-cyan-400 border border-slate-700/80 rounded">
              Phase 2 UI
            </span>
          </div>
          <p className="hidden md:block text-[11px] text-slate-400 truncate max-w-lg">
            {currentMeta.description}
          </p>
        </div>
      </div>

      {/* Right: Real API Health Indicator & Refresh Button */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        <div className="hidden sm:flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
          <Server className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-500">FastAPI:</span>
        </div>

        <button
          onClick={refresh}
          title="Click to re-ping API health"
          className="flex items-center space-x-2 px-2.5 py-1 rounded-full border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 transition-all text-xs font-mono"
        >
          {loading ? (
            <StatusBadge status="warning" label="Checking API..." size="sm" />
          ) : isConnected ? (
            <StatusBadge status="safe" label="API Connected" size="sm" />
          ) : (
            <StatusBadge status="threat" label="API Offline" size="sm" />
          )}

          <RefreshCw
            className={`w-3 h-3 text-slate-400 hover:text-cyan-400 transition-colors ${
              loading ? 'animate-spin' : ''
            }`}
          />
        </button>
      </div>
    </header>
  );
}
