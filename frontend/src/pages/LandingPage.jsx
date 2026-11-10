import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  Cpu,
  Layers,
  Activity,
  Server,
  UploadCloud,
} from 'lucide-react';
import { ROUTES, APP_INFO } from '../utils/constants';
import useApiHealth from '../hooks/useApiHealth';
import StatusBadge from '../components/StatusBadge';

export default function LandingPage() {
  const { isConnected, loading } = useApiHealth();

  const workflowSteps = [
    {
      step: '01',
      title: 'Network Traffic',
      desc: 'Ingestion of network packet logs and flow capture summaries (CSV).',
      icon: Activity,
    },
    {
      step: '02',
      title: 'Data Processing',
      desc: 'Feature extraction, missing value imputation, protocol encoding, and scaling.',
      icon: Layers,
    },
    {
      step: '03',
      title: 'Machine Learning',
      desc: 'Multi-layer classification models evaluate traffic characteristics against attack signatures.',
      icon: Cpu,
    },
    {
      step: '04',
      title: 'Threat Detection',
      desc: 'Instant classification into Normal Traffic or Potential Malicious Intrusion.',
      icon: Shield,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-6 sm:py-12 px-4 sm:px-6">
      {/* Background radial glow */}
      <div className="relative w-full max-w-5xl">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          
          {/* Status Pill */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full text-xs font-mono bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span>ML INTRUSION DETECTION ENGINE &bull; NSL-KDD</span>
          </div>

          {/* Main Title & Tagline */}
          <div className="space-y-3 max-w-3xl">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white font-mono">
              <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                {APP_INFO.name}
              </span>
            </h1>
            <p className="text-lg sm:text-2xl font-medium text-slate-300 tracking-wide font-sans">
              {APP_INFO.subtitle}
            </p>
          </div>

          {/* Description (Required) */}
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            {APP_INFO.description}
          </p>

          {/* Primary Action Button (Required) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <Link
              to={ROUTES.DASHBOARD}
              className="inline-flex items-center space-x-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_25px_rgba(0,242,254,0.3)] hover:shadow-[0_0_35px_rgba(0,242,254,0.5)] transition-all transform hover:-translate-y-0.5"
            >
              <Shield className="w-4 h-4" />
              <span>Open Security Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to={ROUTES.ANALYZE}
              className="inline-flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-sm font-medium transition-colors"
            >
              <UploadCloud className="w-4 h-4 text-cyan-400" />
              <span>Upload Traffic Logs</span>
            </Link>
          </div>

          {/* Secondary Section: Project Workflow (Required) */}
          <div className="w-full max-w-4xl pt-6">
            <div className="mb-6 text-center">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-500">
                Detection Architecture
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mt-1">
                Project Workflow Pipeline
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.step}
                    className="p-5 rounded-xl glass-panel border border-slate-800/80 text-left relative group hover:border-cyan-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-500">
                        {step.step}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100 mb-1">
                      {step.title}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>

                    {idx < workflowSteps.length - 1 && (
                      <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 text-slate-600">
                        →
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Real Backend Connection Badge */}
          <div className="w-full max-w-md p-4 rounded-xl glass-panel border border-slate-800 text-left space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center space-x-1.5">
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>Backend Gateway:</span>
              </span>
              <StatusBadge
                status={loading ? 'warning' : isConnected ? 'safe' : 'threat'}
                label={loading ? 'Probing...' : isConnected ? 'API Connected' : 'API Offline'}
                size="sm"
              />
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              GET /api/v1/health • {isConnected ? 'FastAPI 200 OK' : 'Start backend server to connect'}
            </p>
          </div>

          {/* Notice: No Live Protection Claim (Required by prompt) */}
          <div className="max-w-xl p-3.5 rounded-lg border border-slate-800/80 bg-slate-950/60 text-slate-500 text-[11px] leading-relaxed">
            <span className="font-semibold text-slate-400">Architecture Scope:</span> NetGuard AI is currently configured for offline network flow log analysis and batch detection. Live packet capture and real-time active perimeter mitigation are reserved for subsequent phases.
          </div>

        </div>
      </div>
    </div>
  );
}
