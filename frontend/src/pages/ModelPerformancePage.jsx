import React, { useEffect, useState } from 'react';
import {
  Cpu,
  Target,
  Award,
  Zap,
  Grid,
  Layers,
  RefreshCw,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import MetricCard from '../components/MetricCard';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { fetchModelInfo } from '../services/api';

export default function ModelPerformancePage() {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadModelData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchModelInfo();
      if (res.success) {
        setModelInfo(res.data);
      } else {
        setError(res.error || 'Failed to fetch model metadata.');
      }
    } catch (e) {
      setError(e.message || 'Error communicating with backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModelData();
  }, []);

  const isTrained = modelInfo?.trained;
  const metrics = modelInfo?.evaluation_metrics || {};
  const cm = metrics.confusion_matrix || {};
  const modelsCompared = modelInfo?.models_compared || {};

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        title="AI Model Performance"
        description="Verified validation metrics and cross-model benchmarks evaluated on real test datasets."
        badge={
          <StatusBadge
            status={isTrained ? 'safe' : 'warning'}
            label={isTrained ? `${modelInfo.model_name} (Active)` : 'Model Untrained'}
            size="sm"
          />
        }
        actions={
          <button
            onClick={loadModelData}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Refresh model info"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        }
      />

      {loading ? (
        <div className="py-12">
          <LoadingState message="Loading verified ML evaluation metrics from backend..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to Load Model Performance Metrics"
          message={error}
          onRetry={loadModelData}
        />
      ) : isTrained ? (
        <>
          {/* Active Model Status Banner */}
          <div className="p-6 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/25 via-slate-900/50 to-slate-900/70 glass-panel">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
                <Cpu className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-base sm:text-lg text-slate-100 font-sans">
                    Production Model: {modelInfo.model_name}
                  </span>
                  <StatusBadge status="safe" label="Verified on Test Set" size="sm" />
                </div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {modelInfo.selection_reason}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-[11px] font-mono text-slate-400">
                  <span>Dataset: <strong className="text-cyan-400">{modelInfo.dataset_name}</strong></span>
                  <span>Train Records: <strong className="text-slate-200">{modelInfo.training_records?.toLocaleString()}</strong></span>
                  <span>Unseen Test Records: <strong className="text-slate-200">{modelInfo.test_records?.toLocaleString()}</strong></span>
                  <span>Features: <strong className="text-slate-200">{modelInfo.input_features_count}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Core Evaluation Metrics Cards */}
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Real Test Set Evaluation Metrics ({modelInfo.test_records?.toLocaleString() || 'Test'} Records)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Overall Accuracy"
                value={`${(metrics.accuracy * 100).toFixed(2)}%`}
                icon={Target}
                subtitle="Overall test correctness"
                status="neutral"
              />
              <MetricCard
                title="Precision"
                value={`${(metrics.precision * 100).toFixed(2)}%`}
                icon={Award}
                subtitle="Alert purity (low false alarms)"
                status="safe"
              />
              <MetricCard
                title="Recall (Detection Rate)"
                value={`${(metrics.recall * 100).toFixed(2)}%`}
                icon={Zap}
                subtitle="Actual intrusions detected"
                status="threat"
              />
              <MetricCard
                title="F1 Score"
                value={`${(metrics.f1_score * 100).toFixed(2)}%`}
                icon={Cpu}
                subtitle="Harmonic balance"
                status="info"
              />
            </div>
          </div>

          {/* Section: Confusion Matrix */}
          <SectionCard
            title="Confusion Matrix"
            description={`Evaluated across all ${modelInfo.test_records?.toLocaleString()} unseen flow records in KDDTest+`}
            icon={Grid}
          >
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto my-2">
                  {/* True Negatives (TN) */}
                  <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-950/15 text-center space-y-1">
                    <span className="text-[10px] font-mono uppercase text-emerald-400 font-semibold">
                      True Negatives (TN)
                    </span>
                    <div className="text-2xl font-bold font-mono text-emerald-200">
                      {cm.tn?.toLocaleString() || '--'}
                    </div>
                    <p className="text-[11px] text-slate-400">Actual Normal &rarr; Classified Normal</p>
                  </div>

                  {/* False Positives (FP) */}
                  <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-950/15 text-center space-y-1">
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-semibold">
                      False Positives (FP)
                    </span>
                    <div className="text-2xl font-bold font-mono text-amber-200">
                      {cm.fp?.toLocaleString() || '--'}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {cm.fp != null && cm.tn != null && cm.fp + cm.tn > 0
                        ? `Actual Normal → False Alarms (${((cm.fp / (cm.fp + cm.tn)) * 100).toFixed(2)}% FPR)`
                        : 'Actual Normal → False Alarms'}
                    </p>
                  </div>

                  {/* False Negatives (FN) */}
                  <div className="p-4 rounded-xl border border-rose-500/25 bg-rose-950/15 text-center space-y-1">
                    <span className="text-[10px] font-mono uppercase text-rose-400 font-semibold">
                      False Negatives (FN)
                    </span>
                    <div className="text-2xl font-bold font-mono text-rose-200">
                      {cm.fn?.toLocaleString() || '--'}
                    </div>
                    <p className="text-[11px] text-slate-400">Actual Intrusion &rarr; Missed Threats</p>
                  </div>

                  {/* True Positives (TP) */}
                  <div className="p-4 rounded-xl border border-cyan-500/25 bg-cyan-950/15 text-center space-y-1">
                    <span className="text-[10px] font-mono uppercase text-cyan-400 font-semibold">
                      True Positives (TP)
                    </span>
                    <div className="text-2xl font-bold font-mono text-cyan-200">
                      {cm.tp?.toLocaleString() || '--'}
                    </div>
                    <p className="text-[11px] text-slate-400">Actual Intrusion &rarr; Intrusions Intercepted</p>
                  </div>
                </div>

                <p className="text-center text-xs text-slate-500 font-mono mt-4">
                  Confusion matrix calculated directly from official benchmark test dataset (KDDTest+.txt).
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Section: Candidate Model Comparison */}
          <SectionCard
            title="Candidate Models Quantitative Comparison"
            description="Comparison of baseline and candidate ML classifiers trained and evaluated on identical splits"
            icon={Layers}
          >
            <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 font-mono text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Algorithm</th>
                    <th className="py-3 px-4 text-right">Accuracy</th>
                    <th className="py-3 px-4 text-right">Precision</th>
                    <th className="py-3 px-4 text-right">Recall</th>
                    <th className="py-3 px-4 text-right">F1 Score</th>
                    <th className="py-3 px-4 text-right">ROC-AUC</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
                  {Object.entries(modelsCompared).map(([name, m]) => {
                    const isSelected = name === modelInfo.model_name;
                    return (
                      <tr key={name} className={isSelected ? 'bg-cyan-950/20 font-semibold' : 'hover:bg-slate-900/30'}>
                        <td className="py-3 px-4 font-sans text-slate-100 flex items-center space-x-2">
                          <span>{name}</span>
                          {isSelected && <span className="text-[10px] text-cyan-400 font-mono">[Selected]</span>}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-200">{(m.accuracy * 100).toFixed(2)}%</td>
                        <td className="py-3 px-4 text-right text-slate-200">{(m.precision * 100).toFixed(2)}%</td>
                        <td className="py-3 px-4 text-right text-slate-200">{(m.recall * 100).toFixed(2)}%</td>
                        <td className="py-3 px-4 text-right text-cyan-300 font-bold">{(m.f1_score * 100).toFixed(2)}%</td>
                        <td className="py-3 px-4 text-right text-slate-400">{m.roc_auc ? m.roc_auc.toFixed(4) : 'N/A'}</td>
                        <td className="py-3 px-4 text-center">
                          <StatusBadge
                            status={isSelected ? 'safe' : 'neutral'}
                            label={isSelected ? 'Active Model' : 'Compared'}
                            size="sm"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </>
      ) : (
        <div className="p-8 text-center">
          <p className="text-slate-400 text-sm">Model has not been trained yet.</p>
        </div>
      )}
    </div>
  );
}
