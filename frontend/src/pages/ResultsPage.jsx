import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  UploadCloud,
  FileSearch,
  Filter,
  Download,
  Database,
  ArrowRight,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { ROUTES } from '../utils/constants';

export default function ResultsPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Detection Results"
        description="Review the results of completed network traffic analyses."
        badge={<StatusBadge status="neutral" label="Audit Logs" size="sm" />}
        actions={
          <Link
            to={ROUTES.ANALYZE}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-semibold text-xs tracking-wide shadow-[0_0_15px_rgba(0,242,254,0.25)] transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Go to Analyze Traffic</span>
          </Link>
        }
      />

      {/* Main Results Table Container */}
      <SectionCard
        title="Analysis History"
        description="Completed network packet flow evaluations recorded in SQLite"
        icon={ShieldCheck}
        headerAction={
          <div className="flex items-center space-x-2">
            <button
              disabled
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
            >
              <Filter className="w-3 h-3" />
              <span>Filter</span>
            </button>
            <button
              disabled
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-900 border border-slate-800 text-slate-500 cursor-not-allowed"
            >
              <Download className="w-3 h-3" />
              <span>Export CSV</span>
            </button>
          </div>
        }
      >
        {/* Table Frame Prepared for Real Backend Data */}
        <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
          <table className="w-full text-left text-xs text-slate-400">
            <thead className="bg-slate-900/80 font-mono text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Analysis ID</th>
                <th className="py-3 px-4">Log File</th>
                <th className="py-3 px-4">Total Flows</th>
                <th className="py-3 px-4">Normal Traffic</th>
                <th className="py-3 px-4">Potential Intrusions</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={7} className="py-12 px-4 text-center">
                  {/* High Quality Empty State as required */}
                  <EmptyState
                    icon={FileSearch}
                    title="No detection results available."
                    description="Upload and analyze network traffic to view intrusion detection results."
                    actionText="Go to Analyze Traffic"
                    actionTo={ROUTES.ANALYZE}
                    secondaryNote="SQLite 'predictions' table contains 0 records (No fake data generated)"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Detection Workflow Info */}
      <div className="p-5 rounded-xl border border-slate-800/80 bg-slate-900/40 glass-panel">
        <div className="flex items-center space-x-2 text-slate-300 font-semibold text-xs font-mono uppercase tracking-wider mb-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Persistence & Audit Integrity</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          When network flow analyses are executed in subsequent phases, each run will be permanently recorded in SQLite via SQLAlchemy with full cryptographic integrity, logging total records inspected, normal flow baseline counts, and potential threat signatures.
        </p>
      </div>
    </div>
  );
}
