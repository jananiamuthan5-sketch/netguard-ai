import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  UploadCloud,
  ShieldCheck,
  BarChart3,
  Cpu,
  Home,
  X,
  RefreshCw,
  Terminal,
  Activity,
} from 'lucide-react';
import { ROUTES, APP_INFO } from '../utils/constants';
import useApiHealth from '../hooks/useApiHealth';
import StatusBadge from './StatusBadge';

export default function Sidebar({ mobileOpen = false, setMobileOpen = () => {} }) {
  const { isConnected, statusText, loading, refresh } = useApiHealth();

  const navItems = [
    {
      name: 'Dashboard',
      path: ROUTES.DASHBOARD,
      icon: LayoutDashboard,
      description: 'Security overview & metrics',
    },
    {
      name: 'Analyze Traffic',
      path: ROUTES.ANALYZE,
      icon: UploadCloud,
      description: 'Upload & inspect flow logs',
    },
    {
      name: 'Detection Results',
      path: ROUTES.RESULTS,
      icon: ShieldCheck,
      description: 'Review intrusion audit logs',
    },
    {
      name: 'Analytics',
      path: ROUTES.ANALYTICS,
      icon: BarChart3,
      description: 'Threat trends & telemetry',
    },
    {
      name: 'Model Performance',
      path: ROUTES.MODEL_PERFORMANCE,
      icon: Cpu,
      description: 'ML validation metrics',
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#080d1a] border-r border-slate-800/90 text-slate-300">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40">
        <Link
          to={ROUTES.HOME}
          onClick={() => setMobileOpen(false)}
          className="flex items-center space-x-3 group"
        >
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,242,254,0.15)]">
            <Shield className="w-5 h-5 group-hover:scale-105 transition-transform" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base tracking-wider text-slate-100 font-mono">
                NETGUARD
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-widest bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
                AI
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-sans tracking-tight truncate max-w-[130px]">
              Intrusion Detection
            </p>
          </div>
        </Link>

        {/* Mobile Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Section */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent border-l-2 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,242,254,0.08)]'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
          Quick Access
        </div>

        <Link
          to={ROUTES.HOME}
          onClick={() => setMobileOpen(false)}
          className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 transition-colors group"
        >
          <Home className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
          <span>Landing Screen</span>
        </Link>
      </div>

      {/* Bottom System Status Widget (Required) */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 m-2 rounded-xl border">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-300">
              System Status
            </span>
          </div>
          <button
            onClick={refresh}
            title="Refresh status"
            className="text-slate-500 hover:text-cyan-400 transition-colors p-1"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Real API Status Badge */}
        <div className="mb-2.5">
          {loading ? (
            <StatusBadge status="warning" label="Checking API..." size="sm" />
          ) : isConnected ? (
            <StatusBadge status="safe" label="API Connected" size="sm" />
          ) : (
            <StatusBadge status="threat" label="API Offline" size="sm" />
          )}
        </div>

        {/* Real Status Details (No fake trained model claim) */}
        <div className="space-y-1 text-[10px] font-mono text-slate-400">
          <div className="flex justify-between">
            <span className="text-slate-500">Backend API:</span>
            <span className={isConnected ? 'text-emerald-400' : 'text-rose-400'}>
              {isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">AI Model:</span>
            <span className="text-amber-400">Untrained (Phase 5)</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 sticky top-0 h-screen z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
