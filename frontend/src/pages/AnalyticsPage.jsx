import React from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart as PieIcon,
  BarChart2,
  TrendingUp,
  ShieldAlert,
  UploadCloud,
  Layers,
} from 'lucide-react';
import { ResponsiveContainer } from 'recharts';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { ROUTES } from '../utils/constants';

/**
 * Empty Chart Container Component
 * Renders a structured frame prepared for Recharts with clean empty state.
 */
function ChartPlaceholder({
  icon: Icon,
  chartType,
  title,
  description = 'Analytics will appear after network traffic is analyzed.',
}) {
  return (
    <div className="h-64 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-6 text-center relative overflow-hidden group">
      {/* Subtle chart grid backdrop lines */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#00f2fe_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-3 shadow-[0_0_15px_rgba(0,242,254,0.1)]">
        <Icon className="w-6 h-6" />
      </div>

      <div className="space-y-1 max-w-xs z-10">
        <div className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-medium text-slate-400 bg-slate-800 border border-slate-700 mb-1">
          {chartType}
        </div>
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Security Analytics"
        description="Explore network traffic and intrusion detection trends."
        badge={<StatusBadge status="info" label="Telemetry Ready" size="sm" />}
        actions={
          <Link
            to={ROUTES.ANALYZE}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-xs font-mono transition-colors"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Flow Data</span>
          </Link>
        }
      />

      {/* Grid of Four Prepared Recharts Analytics Containers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Traffic Distribution */}
        <SectionCard
          title="Traffic Distribution"
          description="Normal vs. malicious network flow volume breakdown"
          icon={PieIcon}
        >
          <ChartPlaceholder
            icon={PieIcon}
            chartType="Recharts Pie / Donut"
            title="Normal vs Malicious Proportions"
            description="Analytics will appear after network traffic is analyzed."
          />
        </SectionCard>

        {/* 2. Intrusion Distribution */}
        <SectionCard
          title="Intrusion Distribution"
          description="Classification by attack vector and anomaly category"
          icon={BarChart2}
        >
          <ChartPlaceholder
            icon={BarChart2}
            chartType="Recharts BarChart"
            title="Attack Vector Breakdown"
            description="Analytics will appear after network traffic is analyzed."
          />
        </SectionCard>

        {/* 3. Analysis Trends */}
        <SectionCard
          title="Analysis Trends"
          description="Temporal timeline of analyzed packet flow volume"
          icon={TrendingUp}
        >
          <ChartPlaceholder
            icon={TrendingUp}
            chartType="Recharts AreaChart"
            title="Volume & Anomaly Timeline"
            description="Analytics will appear after network traffic is analyzed."
          />
        </SectionCard>

        {/* 4. Risk Distribution */}
        <SectionCard
          title="Risk Distribution"
          description="Threat severity indexing across evaluated sessions"
          icon={ShieldAlert}
        >
          <ChartPlaceholder
            icon={ShieldAlert}
            chartType="Recharts RadialBar"
            title="Threat Severity Scoring"
            description="Analytics will appear after network traffic is analyzed."
          />
        </SectionCard>
      </div>

      {/* Global Analytics Notice */}
      <div className="p-4 sm:p-5 rounded-xl border border-slate-800 bg-slate-900/40 glass-panel flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 text-center sm:text-left">
          <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 shrink-0 hidden sm:block">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-100">
              Telemetry Pipelines Configured
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Recharts container layouts are structured to bind to live prediction aggregates as soon as traffic files are ingested.
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
