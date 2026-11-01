import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Activity, 
  Cpu, 
  Database, 
  Binary, 
  Layers, 
  CheckCircle2, 
  Server, 
  AlertTriangle,
  ArrowRight,
  Terminal
} from 'lucide-react';
import { ROUTES, APP_INFO } from '../utils/constants';
import useApiHealth from '../hooks/useApiHealth';

export default function LandingPage() {
  const { isConnected, data, loading, error, refresh } = useApiHealth();

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      {/* Background radial glow */}
      <div className="relative w-full max-w-5xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          
          {/* Phase 1 Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>PHASE 1 : PROJECT FOUNDATION COMPLETE</span>
          </div>

          {/* Main Title & Tagline */}
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-white font-mono">
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                {APP_INFO.name}
              </span>
            </h1>
            <p className="text-xl sm:text-2xl font-medium text-slate-300 tracking-wide">
              {APP_INFO.tagline}
            </p>
          </div>

          {/* Phase Notice Message (Required by prompt) */}
          <div className="max-w-2xl p-4 rounded-xl glass-panel border border-cyan-500/20 text-slate-300 text-sm sm:text-base leading-relaxed cyber-glow">
            <p className="italic text-cyan-100 font-light">
              “Project foundation is being prepared. AI-powered network traffic analysis will be available in upcoming phases.”
            </p>
          </div>

          {/* Live Backend Connection Card */}
          <div className="w-full max-w-xl glass-panel rounded-2xl p-5 border border-slate-800 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center space-x-2">
                <Server className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-semibold text-slate-300 uppercase tracking-wider">FastAPI Backend Status</span>
              </div>
              <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${
                loading 
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                  : isConnected 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {loading ? 'Checking...' : isConnected ? 'Connected (200 OK)' : 'Offline'}
              </span>
            </div>

            <div className="pt-3 font-mono text-xs text-slate-400 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Endpoint:</span>
                <span className="text-slate-300">GET /api/v1/health</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="text-slate-300">{data?.service || 'NetGuard AI API'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Health State:</span>
                <span className={isConnected ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {data?.status || (loading ? 'Probing...' : 'Unreachable (Check Backend Server)')}
                </span>
              </div>
            </div>
          </div>

          {/* Architecture Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl pt-4">
            {/* Frontend Pillar */}
            <div className="p-5 rounded-xl glass-panel border border-slate-800/80 text-left space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-200 text-sm">Frontend Foundation</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                React 18 SPA bundled with Vite, Tailwind CSS cybersecurity styling, and React Router multi-page routing.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">React</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">Vite</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">Tailwind</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">Router</span>
              </div>
            </div>

            {/* Backend Pillar */}
            <div className="p-5 rounded-xl glass-panel border border-slate-800/80 text-left space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                  <Database className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-200 text-sm">Backend Foundation</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Python FastAPI REST backend with Uvicorn, SQLAlchemy ORM, and SQLite prediction schema.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">FastAPI</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">SQLAlchemy</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">SQLite</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">Pydantic</span>
              </div>
            </div>

            {/* ML Pillar */}
            <div className="p-5 rounded-xl glass-panel border border-slate-800/80 text-left space-y-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-200 text-sm">ML Architecture</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Structured machine learning pipeline for data preprocessing, stratified training, and flow evaluation.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">Scikit-learn</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">Pandas</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">NumPy</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">Joblib</span>
              </div>
            </div>
          </div>

          {/* Planned Classification Target Display */}
          <div className="w-full max-w-4xl p-6 rounded-2xl glass-panel border border-slate-800/80 text-left space-y-4">
            <div className="flex items-center space-x-2">
              <Binary className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                Planned Classification Engine Scope
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-emerald-300">1. Normal / Benign Traffic</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Standard protocol operations, authorized sessions, and regular network flow telemetry.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/20 flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-rose-300">2. Potential Intrusion / Malicious Traffic</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    DoS/DDoS attacks, reconnaissance port scans, brute-force anomalies, and malicious flows.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Exploration Navigation Links for Registered Future Routes */}
          <div className="pt-2 text-center space-y-3">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-mono">
              Prepared Application Routes
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              <Link to={ROUTES.DASHBOARD} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors flex items-center space-x-1.5">
                <span>Dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to={ROUTES.ANALYZE} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors flex items-center space-x-1.5">
                <span>Analyze Traffic</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to={ROUTES.RESULTS} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors flex items-center space-x-1.5">
                <span>Prediction History</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to={ROUTES.ANALYTICS} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors flex items-center space-x-1.5">
                <span>Threat Analytics</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
              <Link to={ROUTES.MODEL_PERFORMANCE} className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:border-cyan-500/40 hover:text-cyan-300 transition-colors flex items-center space-x-1.5">
                <span>Model Metrics</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
