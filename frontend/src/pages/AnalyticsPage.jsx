import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart as PieIcon,
  BarChart2,
  TrendingUp,
  ShieldAlert,
  UploadCloud,
  Layers,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { ROUTES } from '../utils/constants';
import { fetchAnalytics } from '../services/api';

const COLORS = ['#10b981', '#f43f5e'];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchAnalytics();
      if (res.success) {
        setAnalytics(res.data);
      } else {
        setError(res.error || 'Failed to retrieve telemetry analytics.');
      }
    } catch (e) {
      setError(e.message || 'Error communicating with backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const hasData = analytics && analytics.total_records > 0;

  // Pie chart data: Normal vs Intrusion
  const pieData = hasData
    ? [
        { name: 'Normal Traffic', value: analytics.normal_count },
        { name: 'Potential Intrusions', value: analytics.intrusion_count },
      ]
    : [];

  // Bar chart data per session
  const sessionData = (analytics?.sessions || []).map((s) => ({
    name: `Session #${s.id}`,
    Normal: s.normal,
    Intrusions: s.intrusion,
    Total: s.total,
    Rate: s.intrusion_rate,
  }));

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Security Analytics"
        description="Comprehensive network traffic telemetry and AI intrusion classification trends."
        badge={
          <StatusBadge
            status={loading ? 'warning' : error ? 'threat' : 'safe'}
            label={loading ? 'Loading Telemetry...' : error ? 'Telemetry Offline' : 'Telemetry Active'}
            size="sm"
          />
        }
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={loadAnalytics}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to={ROUTES.ANALYZE}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs tracking-wide transition-all shadow-[0_0_15px_rgba(0,242,254,0.25)]"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Flow Data</span>
            </Link>
          </div>
        }
      />

      {loading ? (
        <div className="py-12">
          <LoadingState message="Aggregating network intrusion telemetry from SQLite..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to Load Security Analytics"
          message={error}
          onRetry={loadAnalytics}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Traffic Distribution (Pie/Donut) */}
          <SectionCard
            title="Traffic Classification Distribution"
            description="Proportion of verified normal vs malicious network flows"
            icon={PieIcon}
          >
            {hasData ? (
              <div className="h-64 w-full flex flex-col items-center justify-center pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="text-center font-mono text-xs text-slate-400 mt-2">
                  Total Flows: <span className="text-slate-100 font-bold">{analytics.total_records.toLocaleString()}</span> &bull; Threat Ratio: <span className="text-rose-400 font-bold">{analytics.intrusion_rate}%</span>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={PieIcon}
                title="No traffic distribution data"
                description="Upload and analyze network flows in the Analyze view to generate classification distribution charts."
                actionText="Go to Analyze Traffic"
                actionTo={ROUTES.ANALYZE}
                compact
              />
            )}
          </SectionCard>

          {/* 2. Intrusion Breakdown by Session (BarChart) */}
          <SectionCard
            title="Session Threat Breakdown"
            description="Normal vs Intrusion counts across evaluated capture files"
            icon={BarChart2}
          >
            {hasData ? (
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
                    <Bar dataKey="Normal" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Intrusions" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={BarChart2}
                title="No session breakdown data"
                description="Historical sessions from SQLite will appear here after network traffic files are submitted."
                compact
              />
            )}
          </SectionCard>

          {/* 3. Analysis Trends (AreaChart) */}
          <SectionCard
            title="Flow Volume & Detection Timeline"
            description="Total evaluated network flows and threat density over time"
            icon={TrendingUp}
          >
            {hasData ? (
              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sessionData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f2fe" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#00f2fe" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        borderColor: '#334155',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Area type="monotone" dataKey="Total" stroke="#00f2fe" fillOpacity={1} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="No trend data available"
                description="Timeline charts will populate as multiple flow log captures are evaluated."
                compact
              />
            )}
          </SectionCard>

          {/* 4. Threat Severity Indexing */}
          <SectionCard
            title="Threat Posture & Post-Analysis Risk"
            description="Aggregated risk indexing calculated from real database history"
            icon={ShieldAlert}
          >
            {hasData ? (
              <div className="space-y-4 p-2">
                <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 flex items-center justify-between">
                  <span className="text-xs font-mono text-slate-400">Current Threat Posture</span>
                  <StatusBadge
                    status={analytics.threat_level === 'ELEVATED' ? 'threat' : analytics.threat_level === 'MODERATE' ? 'warning' : 'safe'}
                    label={`${analytics.threat_level} THREAT LEVEL`}
                    size="sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">Benign Normal Flows</span>
                    <div className="text-xl font-bold font-mono text-slate-200 mt-1">{analytics.normal_count.toLocaleString()}</div>
                  </div>
                  <div className="p-3.5 rounded-xl border border-rose-500/20 bg-rose-950/10">
                    <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold">Intrusions Intercepted</span>
                    <div className="text-xl font-bold font-mono text-rose-300 mt-1">{analytics.intrusion_count.toLocaleString()}</div>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-800 bg-slate-950/50 font-mono text-xs text-slate-400">
                  Total Analysis Sessions in SQLite: <span className="text-cyan-400 font-semibold">{analytics.total_sessions}</span>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={ShieldAlert}
                title="No threat risk data"
                description="Threat posture metrics will be computed once traffic logs have been evaluated."
                compact
              />
            )}
          </SectionCard>
        </div>
      )}

      {/* Global Telemetry Info */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/40 glass-panel flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shrink-0 hidden sm:block">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">
              Aggregated Database Telemetry Active
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              All charts and metrics are computed dynamically from real analysis sessions recorded in SQLite.
            </p>
          </div>
        </div>

        <Link
          to={ROUTES.ANALYZE}
          className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs tracking-wide transition-all shrink-0"
        >
          <span>Analyze Network Traffic</span>
        </Link>
      </div>
    </div>
  );
}
