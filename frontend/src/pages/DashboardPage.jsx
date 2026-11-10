import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  UploadCloud,
  FileText,
  Server,
  ArrowRight,
  BarChart2,
  Clock,
  Radio,
  RefreshCw,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import PageHeader from '../components/PageHeader';
import MetricCard from '../components/MetricCard';
import SectionCard from '../components/SectionCard';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { ROUTES } from '../utils/constants';
import useApiHealth from '../hooks/useApiHealth';
import { fetchAnalytics, fetchModelInfo, fetchPredictions } from '../services/api';

const PIE_COLORS = ['#10b981', '#f43f5e'];

export default function DashboardPage() {
  const { isConnected, loading: healthLoading } = useApiHealth();
  const [analytics, setAnalytics] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, modelRes, predsRes] = await Promise.all([
        fetchAnalytics(),
        fetchModelInfo(),
        fetchPredictions(0, 5),
      ]);

      if (analyticsRes.success) setAnalytics(analyticsRes.data);
      if (modelRes.success) setModelInfo(modelRes.data);
      if (predsRes.success) setRecentRecords(predsRes.data || []);

      if (!analyticsRes.success && !modelRes.success && !predsRes.success) {
        setError(analyticsRes.error || 'Unable to connect to the NetGuard AI backend service.');
      }
    } catch (e) {
      setError(e.message || 'Unexpected error loading security dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [isConnected]);

  const hasData = analytics && analytics.total_records > 0;

  // Pie chart breakdown
  const pieData = hasData
    ? [
        { name: 'Normal / Benign', value: analytics.normal_count },
        { name: 'Potential Intrusions', value: analytics.intrusion_count },
      ]
    : [];

  const modelRecall = modelInfo?.evaluation_metrics?.recall
    ? `${(modelInfo.evaluation_metrics.recall * 100).toFixed(1)}%`
    : '--';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Security Overview"
        description="Monitor aggregated network telemetry and AI intrusion classification metrics."
        badge={
          <StatusBadge
            status={isConnected ? 'safe' : 'threat'}
            label={isConnected ? 'Engine Ready' : 'API Disconnected'}
            size="sm"
          />
        }
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={loadDashboardData}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Refresh telemetry"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to={ROUTES.ANALYZE}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs tracking-wide shadow-[0_0_15px_rgba(0,242,254,0.25)] transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Analyze Network Traffic</span>
            </Link>
          </div>
        }
      />

      {/* Loading / Error Banner or Telemetry */}
      {loading && !analytics && (
        <LoadingState message="Synchronizing security telemetry with FastAPI backend..." compact />
      )}
      {!loading && error && (
        <ErrorState
          title="Backend Telemetry Unreachable"
          message={error}
          onRetry={loadDashboardData}
        />
      )}

      {/* Four Metric Cards with Real Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Traffic Analyzed"
          value={hasData ? analytics.total_records.toLocaleString() : '--'}
          icon={Activity}
          subtitle={hasData ? `${analytics.total_sessions} analysis session(s)` : 'No traffic analyzed yet'}
          emptyMessage="Upload flow logs to begin"
          status="neutral"
        />
        <MetricCard
          title="Normal Traffic"
          value={hasData ? analytics.normal_count.toLocaleString() : '--'}
          icon={ShieldCheck}
          subtitle={hasData ? `${((analytics.normal_count / analytics.total_records) * 100).toFixed(1)}% benign baseline` : 'Awaiting inspection'}
          emptyMessage="0 flows confirmed benign"
          status="safe"
        />
        <MetricCard
          title="Potential Intrusions"
          value={hasData ? analytics.intrusion_count.toLocaleString() : '--'}
          icon={ShieldAlert}
          subtitle={hasData ? `${analytics.intrusion_rate}% threat detection rate` : 'Awaiting inspection'}
          emptyMessage="0 threats intercepted"
          status={hasData && analytics.intrusion_count > 0 ? 'threat' : 'safe'}
        />
        <MetricCard
          title="Model Detection Rate"
          value={modelRecall}
          icon={Cpu}
          subtitle={modelInfo?.trained ? `${modelInfo.model_name} (Trained)` : 'Awaiting model training'}
          emptyMessage="Evaluation pending"
          status="info"
        />
      </div>

      {/* Main Status or Callout Banner */}
      {!hasData ? (
        <div className="p-4 sm:p-5 rounded-xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/20 via-slate-900/40 to-blue-950/20 glass-panel flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 text-center sm:text-left">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shrink-0 hidden sm:block">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">
                Ready to inspect network traffic.
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload network flow logs in the Analyze view to trigger AI intrusion classification and store audit sessions.
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
      ) : (
        <div className="p-4 sm:p-5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/25 via-slate-900/50 to-blue-950/25 glass-panel flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shrink-0">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-100">
                System Telemetry Active &bull; Overall Threat Level: {analytics.threat_level}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {analytics.total_records.toLocaleString()} total network flows processed across {analytics.total_sessions} logged session(s).
              </p>
            </div>
          </div>

          <Link
            to={ROUTES.ANALYTICS}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-xs font-mono transition-colors shrink-0"
          >
            <span>View Full Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Section 1: Traffic Overview (Charts) & Section 2: Recent Analysis (Table) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Traffic Overview with Recharts */}
        <SectionCard
          title="Traffic Breakdown"
          description="Classification distribution of inspected network flows"
          icon={BarChart2}
        >
          {hasData ? (
            <div className="h-64 w-full flex flex-col items-center justify-center pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
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
              <div className="text-center font-mono text-[11px] text-slate-400 mt-2">
                Normal: <span className="text-emerald-400 font-semibold">{analytics.normal_count}</span> | Threats: <span className="text-rose-400 font-semibold">{analytics.intrusion_count}</span>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={BarChart2}
              title="No traffic overview data available yet"
              description="Visual distribution charts will render dynamically once network flow logs are submitted."
              actionText="Go to Analyze Traffic"
              actionTo={ROUTES.ANALYZE}
              compact
            />
          )}
        </SectionCard>

        {/* Section 2: Recent Analysis */}
        <SectionCard
          title="Recent Analysis Sessions"
          description="Audit trail of completed network flow prediction runs in SQLite"
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
          <div className="overflow-x-auto rounded-lg border border-slate-800/80 bg-slate-950/40">
            <table className="w-full text-left text-xs text-slate-400">
              <thead className="bg-slate-900/60 font-mono text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3 text-right">Flows</th>
                  <th className="py-2.5 px-3 text-right">Normal</th>
                  <th className="py-2.5 px-3 text-right">Threats</th>
                  <th className="py-2.5 px-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
                {recentRecords.length > 0 ? (
                  recentRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-slate-200 font-sans font-medium truncate max-w-[130px]">
                        {r.file_name}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{r.total_records}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400 font-semibold">{r.normal_count}</td>
                      <td className="py-2.5 px-3 text-right text-rose-400 font-semibold">{r.intrusion_count}</td>
                      <td className="py-2.5 px-3 text-right text-slate-500">
                        {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                ) : (
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
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      {/* Section 3: Subsystem Status */}
      <SectionCard
        title="Subsystem Architecture & Health"
        description="Core subsystem connectivity and model runtime status"
        icon={Server}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Backend Gateway Status */}
          <div className="p-4 rounded-xl glass-panel border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">Backend API</span>
              <StatusBadge
                status={healthLoading ? 'warning' : isConnected ? 'safe' : 'threat'}
                label={healthLoading ? 'Checking...' : isConnected ? 'Connected' : 'Offline'}
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
              <StatusBadge
                status={healthLoading ? 'warning' : isConnected ? 'safe' : 'threat'}
                label={healthLoading ? 'Checking...' : isConnected ? 'SQLite Active' : 'Offline'}
                size="sm"
              />
            </div>
            <p className="text-xs text-slate-300 font-medium">SQLAlchemy ORM</p>
            <p className="text-[11px] text-slate-500 font-mono">
              {isConnected
                ? `Table: predictions (${analytics?.total_sessions ?? 0} session(s) persisted)`
                : 'Database unreachable while backend is offline'}
            </p>
          </div>

          {/* AI Model Status */}
          <div className="p-4 rounded-xl glass-panel border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">AI Model State</span>
              <StatusBadge
                status={
                  healthLoading
                    ? 'warning'
                    : !isConnected
                    ? 'threat'
                    : modelInfo?.trained
                    ? 'safe'
                    : 'warning'
                }
                label={
                  healthLoading
                    ? 'Checking...'
                    : !isConnected
                    ? 'Offline'
                    : modelInfo?.trained
                    ? 'Model Active'
                    : 'Untrained'
                }
                size="sm"
              />
            </div>
            <p className="text-xs text-slate-300 font-medium">
              {modelInfo?.model_name || 'Decision Tree Classifier'}
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              {modelInfo?.evaluation_metrics
                ? `Test Acc: ${(modelInfo.evaluation_metrics.accuracy * 100).toFixed(1)}% | Prec: ${(modelInfo.evaluation_metrics.precision * 100).toFixed(1)}%`
                : 'Dataset: NSL-KDD'}
            </p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
