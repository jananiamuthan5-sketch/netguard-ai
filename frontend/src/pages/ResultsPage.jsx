import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  UploadCloud,
  FileSearch,
  Database,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { ROUTES } from '../utils/constants';
import { fetchPredictions } from '../services/api';

export default function ResultsPage() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadPredictions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPredictions(0, 100);
      if (res.success) {
        setPredictions(res.data || []);
      } else {
        setError(res.error || 'Failed to retrieve prediction records from database.');
      }
    } catch (e) {
      setError(e.message || 'Error communicating with backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPredictions();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Detection Results"
        description="Review historical network flow intrusion detection records stored in SQLite."
        badge={
          <StatusBadge
            status={loading ? 'warning' : error ? 'threat' : 'safe'}
            label={loading ? 'Loading Records...' : error ? 'Database Offline' : 'SQLite Records'}
            size="sm"
          />
        }
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={loadPredictions}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Refresh logs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <Link
              to={ROUTES.ANALYZE}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs tracking-wide shadow-[0_0_15px_rgba(0,242,254,0.25)] transition-all"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Analyze New Traffic</span>
            </Link>
          </div>
        }
      />

      {/* Main Results Table Container */}
      <SectionCard
        title="Analysis History"
        description={`Displaying ${predictions.length} completed network packet flow session(s) saved in SQLite`}
        icon={ShieldCheck}
      >
        {loading ? (
          <div className="py-12">
            <LoadingState message="Fetching prediction sessions from SQLite database..." />
          </div>
        ) : error ? (
          <ErrorState
            title="Unable to Load Detection History"
            message={error}
            onRetry={loadPredictions}
          />
        ) : predictions.length === 0 ? (
          <div className="py-8">
            <EmptyState
              icon={FileSearch}
              title="No detection results available yet."
              description="Upload and analyze network traffic to view real intrusion detection results."
              actionText="Go to Analyze Traffic"
              actionTo={ROUTES.ANALYZE}
              secondaryNote="SQLite 'predictions' table contains 0 records"
            />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
            <table className="w-full text-left text-xs text-slate-400">
              <thead className="bg-slate-900/80 font-mono text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Session ID</th>
                  <th className="py-3 px-4">Log File</th>
                  <th className="py-3 px-4 text-right">Total Flows</th>
                  <th className="py-3 px-4 text-right">Normal Traffic</th>
                  <th className="py-3 px-4 text-right">Threats Detected</th>
                  <th className="py-3 px-4 text-center">Threat Ratio</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
                {predictions.map((p) => {
                  const threatRatio = p.total_records > 0
                    ? ((p.intrusion_count / p.total_records) * 100).toFixed(1)
                    : 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-4 text-cyan-400 font-semibold">#{p.id}</td>
                      <td className="py-3 px-4 text-slate-200 font-sans font-medium">{p.file_name}</td>
                      <td className="py-3 px-4 text-right text-slate-300">{p.total_records.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-emerald-400 font-semibold">{p.normal_count.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-rose-400 font-semibold">{p.intrusion_count.toLocaleString()}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.intrusion_count > 0
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {threatRatio}% threats
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-slate-400">
                        {new Date(p.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Persistence Architecture Info */}
      <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/40 glass-panel">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold text-xs font-mono uppercase tracking-wider mb-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Database Persistence Architecture</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Every traffic capture analyzed by NetGuard AI is persisted to SQLite via SQLAlchemy ORM. Records include the source capture file name, total flows inspected, verified normal traffic baseline, and intercepted cyber intrusion counts with UTC audit timestamps.
        </p>
      </div>
    </div>
  );
}
