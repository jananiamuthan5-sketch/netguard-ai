import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  UploadCloud,
  FileText,
  Database,
  Server,
  ArrowRight,
  BarChart2,
  Clock,
  Radio,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import MetricCard from '../components/MetricCard';
import SectionCard from '../components/SectionCard';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { ROUTES } from '../utils/constants';
import useApiHealth from '../hooks/useApiHealth';

export default function DashboardPage() {
  const { isConnected, loading } = useApiHealth();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Security Overview"
        description="Monitor and analyze network traffic using AI-powered intrusion detection."
        badge={
          <StatusBadge
            status={isConnected ? 'safe' : 'threat'}
            label={isConnected ? 'Engine Ready' : 'API Disconnected'}
            size="sm"
          />
        }
        actions={
          <Link
            to={ROUTES.ANALYZE}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs tracking-wide shadow-[0_0_15px_rgba(0,242,254,0.25)] transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Analyze Network Traffic</span>
          </Link>
        }
      />

      {/* Four Metric Cards (No fake numbers - Clean empty state representation) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Traffic Analyzed"
          value="--"
          icon={Activity}
          subtitle="No traffic analyzed yet"
          emptyMessage="Upload flow logs to begin"
          status="neutral"
        />
        <MetricCard
          title="Normal Traffic"
          value="--"
          icon={ShieldCheck}
          subtitle="Awaiting inspection"
          emptyMessage="0 flows confirmed benign"
          status="safe"
        />
        <MetricCard
          title="Potential Intrusions"
          value="--"
          icon={ShieldAlert}
          subtitle="Awaiting inspection"
          emptyMessage="0 threats intercepted"
          status="threat"
        />
        <MetricCard
          title="Detection Rate"
          value="--"
          icon={Cpu}
          subtitle="Model in training (Phase 5)"
          emptyMessage="Evaluation pending"
          status="info"
        />
      </div>

      {/* Main Empty State Banner */}
      <div className="p-4 sm:p-5 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/40 to-blue-950/20 glass-panel flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5 text-center sm:text-left">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shrink-0 hidden sm:block">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">
              No network traffic has been analyzed yet.
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Upload supported network flow logs (CSV) in the Analyze view to initiate intrusion detection.
            </p>
          </div>
        </div>

        <Link
          to={ROUTES.ANALYZE}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs font-mono transition-colors shrink-0"
        >
          <span>Analyze Network Traffic</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Section 1: Traffic Overview & Section 2: Recent Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Traffic Overview */}
        <SectionCard
          title="Traffic Overview"
          description="Real-time traffic volume and protocol classification breakdown"
          icon={BarChart2}
        >
          <EmptyState
            icon={BarChart2}
            title="No traffic overview data available yet"
            description="Protocol distribution charts and bandwidth breakdown will render dynamically once traffic captures are evaluated."
            actionText="Go to Analyze Traffic"
            actionTo={ROUTES.ANALYZE}
            compact
          />
        </SectionCard>

        {/* Section 2: Recent Analysis */}
        <SectionCard
          title="Recent Analysis"
          description="Audit trail of completed network flow prediction runs"
          icon={FileText}
          headerAction={
            <Link
              to={ROUTES.RESULTS}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center space-x-1"
            >
              <span>View all logs</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          {/* Responsive Table Frame with Empty State */}
          <div className="overflow-x-auto rounded-lg border border-slate-800/80 bg-slate-950/40">
            <table className="w-full text-left text-xs text-slate-400">
              <thead className="bg-slate-900/60 font-mono text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">Flows</th>
                  <th className="py-2.5 px-3">Normal</th>
                  <th className="py-2.5 px-3">Intrusions</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={5} className="py-8 text-center">
                    <EmptyState
                      icon={Clock}
                      title="No recent analysis records"
                      description="Historical records stored in SQLite will appear here after network traffic files are submitted."
                      compact
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* Section 3: Security Status */}
      <SectionCard
        title="Security Status"
        description="Core subsystem connectivity and model runtime health"
        icon={Server}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Backend Gateway Status */}
          <div className="p-4 rounded-xl glass-panel border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Backend API</span>
              <StatusBadge
                status={loading ? 'warning' : isConnected ? 'safe' : 'threat'}
                label={loading ? 'Checking...' : isConnected ? 'Connected' : 'Offline'}
                size="sm"
              />
            </div>
            <p className="text-xs text-slate-300 font-medium">FastAPI REST Gateway</p>
            <p className="text-[11px] text-slate-500 font-mono">
              Endpoint: /api/v1/health ({isConnected ? '200 OK' : 'Unreachable'})
            </p>
          </div>

          {/* Database Status */}
          <div className="p-4 rounded-xl glass-panel border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Database Engine</span>
              <StatusBadge status="safe" label="SQLite Active" size="sm" />
            </div>
            <p className="text-xs text-slate-300 font-medium">SQLAlchemy ORM</p>
            <p className="text-[11px] text-slate-500 font-mono">
              Schema: predictions (0 records, 0 fake data)
            </p>
          </div>

          {/* AI Model Status */}
          <div className="p-4 rounded-xl glass-panel border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">AI Model State</span>
              <StatusBadge status="warning" label="Phase 5 Training" size="sm" />
            </div>
            <p className="text-xs text-slate-300 font-medium">Binary Classification Model</p>
            <p className="text-[11px] text-slate-500 font-mono">
              Architecture: Random Forest / Gradient Boosting
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
