import React from 'react';
import {
  Cpu,
  Target,
  Award,
  Zap,
  Grid,
  Layers,
  HelpCircle,
  Binary,
  CheckCircle2,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import MetricCard from '../components/MetricCard';
import SectionCard from '../components/SectionCard';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

export default function ModelPerformancePage() {
  const candidateModels = [
    {
      name: 'Random Forest Classifier',
      family: 'Ensemble Bagging',
      specs: '100 estimators, max_depth: 20',
      role: 'Primary Candidate (High precision)',
      status: 'Phase 5 Training',
    },
    {
      name: 'Hist Gradient Boosting',
      family: 'Ensemble Boosting',
      specs: 'LightGBM-style binning, early stopping',
      role: 'High throughput flow processing',
      status: 'Candidate',
    },
    {
      name: 'Support Vector Machine (SVM)',
      family: 'Kernel Classifier',
      specs: 'RBF kernel, scaled features',
      role: 'Non-linear boundary validation',
      status: 'Candidate',
    },
    {
      name: 'Logistic Regression',
      family: 'Linear Model',
      specs: 'L2 regularization, scaled features',
      role: 'Baseline performance benchmark',
      status: 'Baseline Candidate',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        title="AI Model Performance"
        description="Review the performance of the Machine Learning intrusion detection model."
        badge={<StatusBadge status="warning" label="Model Untrained" size="sm" />}
      />

      {/* Prominent Visual Empty State Banner (Required by prompt) */}
      <div className="p-6 rounded-2xl border border-amber-500/25 bg-gradient-to-r from-amber-950/20 via-slate-900/40 to-slate-900/60 glass-panel">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 shrink-0">
            <Cpu className="w-8 h-8 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 mb-1">
              Phase 5 Milestone
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100">
              Model training has not been completed yet.
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Model training results will appear here after Phase 5. In accordance with NetGuard AI engineering standards, no simulated or artificial accuracy figures are displayed prior to verified benchmark training.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Sections: Accuracy, Precision, Recall, F1 Score */}
      <div>
        <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
          <Award className="w-4 h-4 text-cyan-400" />
          <span>Core Evaluation Metrics</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Accuracy"
            value="--"
            icon={Target}
            subtitle="Overall correctness"
            emptyMessage="Pending Phase 5 training"
            status="neutral"
          />
          <MetricCard
            title="Precision"
            value="--"
            icon={Award}
            subtitle="Minimizes false alarms"
            emptyMessage="Pending Phase 5 training"
            status="safe"
          />
          <MetricCard
            title="Recall (Detection)"
            value="--"
            icon={Zap}
            subtitle="Interception rate"
            emptyMessage="Pending Phase 5 training"
            status="threat"
          />
          <MetricCard
            title="F1 Score"
            value="--"
            icon={Cpu}
            subtitle="Harmonic balance"
            emptyMessage="Pending Phase 5 training"
            status="info"
          />
        </div>
      </div>

      {/* Section: Confusion Matrix */}
      <SectionCard
        title="Confusion Matrix"
        description="True vs. predicted traffic classification distribution"
        icon={Grid}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto my-2">
              {/* True Negatives (TN) */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-center space-y-1">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">
                  True Negatives (TN)
                </span>
                <div className="text-2xl font-bold font-mono text-slate-200">--</div>
                <p className="text-[11px] text-slate-400">Actual Normal → Predicted Normal</p>
              </div>

              {/* False Positives (FP) */}
              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/10 text-center space-y-1">
                <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold">
                  False Positives (FP)
                </span>
                <div className="text-2xl font-bold font-mono text-slate-200">--</div>
                <p className="text-[11px] text-slate-400">Actual Normal → Predicted Intrusion (False Alarm)</p>
              </div>

              {/* False Negatives (FN) */}
              <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-950/10 text-center space-y-1">
                <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold">
                  False Negatives (FN)
                </span>
                <div className="text-2xl font-bold font-mono text-slate-200">--</div>
                <p className="text-[11px] text-slate-400">Actual Intrusion → Predicted Normal (Missed Threat)</p>
              </div>

              {/* True Positives (TP) */}
              <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-950/10 text-center space-y-1">
                <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold">
                  True Positives (TP)
                </span>
                <div className="text-2xl font-bold font-mono text-slate-200">--</div>
                <p className="text-[11px] text-slate-400">Actual Intrusion → Predicted Intrusion (Detected)</p>
              </div>
            </div>

            <p className="text-center text-xs text-slate-500 font-mono mt-4">
              Confusion matrix values will be computed from test splits during Phase 5 model evaluation.
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Section: Model Comparison */}
      <SectionCard
        title="Model Comparison"
        description="Candidate machine learning architectures evaluated for intrusion classification"
        icon={Layers}
      >
        <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 font-mono text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Architecture Family</th>
                <th className="py-3 px-4">Hyperparameter Specs</th>
                <th className="py-3 px-4">Targeted Use-Case</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
              {candidateModels.map((model) => (
                <tr key={model.name} className="hover:bg-slate-900/30">
                  <td className="py-3 px-4 font-semibold text-slate-100 font-sans">{model.name}</td>
                  <td className="py-3 px-4 text-cyan-400">{model.family}</td>
                  <td className="py-3 px-4 text-slate-400">{model.specs}</td>
                  <td className="py-3 px-4 text-slate-300 font-sans text-xs">{model.role}</td>
                  <td className="py-3 px-4 text-right">
                    <StatusBadge
                      status={model.status.includes('Phase 5') ? 'warning' : 'neutral'}
                      label={model.status}
                      size="sm"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
