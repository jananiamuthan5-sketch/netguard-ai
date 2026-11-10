import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  UploadCloud,
  AlertCircle,
  FileSpreadsheet,
  Trash2,
  Play,
  CheckCircle2,
  Table,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Download,
  RotateCcw,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';
import MetricCard from '../components/MetricCard';
import useApiHealth from '../hooks/useApiHealth';
import { ROUTES, SUPPORTED_FEATURES } from '../utils/constants';
import { uploadTrafficCsv } from '../services/api';

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export default function AnalyzePage() {
  const { isConnected, loading: healthLoading } = useApiHealth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [apiError, setApiError] = useState(null);
  const fileInputRef = useRef(null);

  // File validator
  const handleValidateAndSetFile = (file) => {
    setValidationError(null);
    setApiError(null);
    setAnalysisResult(null);
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setValidationError('Invalid file type. Please upload a CSV (.csv) network flow log file.');
      setSelectedFile(null);
      setFileDetails(null);
      return;
    }

    if (file.size === 0) {
      setValidationError('The selected CSV file is empty (0 bytes). Please choose a valid capture file.');
      setSelectedFile(null);
      setFileDetails(null);
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setValidationError('File exceeds the 50 MB maximum upload limit.');
      setSelectedFile(null);
      setFileDetails(null);
      return;
    }

    setSelectedFile(file);
    setFileDetails({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + ' KB',
      type: file.type || 'text/csv',
      lastModified: new Date(file.lastModified).toLocaleString(),
    });
  };

  // Drag-and-drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleValidateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleValidateAndSetFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileDetails(null);
    setValidationError(null);
    setApiError(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 1-Click Load Sample Demo CSV
  const handleLoadSampleData = async () => {
    try {
      setValidationError(null);
      setApiError(null);
      const res = await fetch('/sample_network_traffic.csv');
      if (!res.ok) throw new Error('Could not fetch sample dataset.');
      const blob = await res.blob();
      const sampleFile = new File([blob], 'sample_network_traffic.csv', { type: 'text/csv' });
      handleValidateAndSetFile(sampleFile);
    } catch (err) {
      setValidationError('Failed to load sample dataset: ' + err.message);
    }
  };

  // Execute Real Analysis via API
  const handleExecuteAnalysis = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setApiError(null);

    const result = await uploadTrafficCsv(selectedFile);
    setIsAnalyzing(false);

    if (result.success) {
      setAnalysisResult(result.data);
    } else {
      setApiError(result.error || 'Failed to analyze network flow capture.');
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Analyze Network Traffic"
        description="Upload real network flow capture data for AI-powered intrusion classification."
        badge={
          <StatusBadge
            status={healthLoading ? 'warning' : isConnected ? 'safe' : 'threat'}
            label={healthLoading ? 'Checking Engine...' : isConnected ? 'ML Inference Ready' : 'Backend Offline'}
            size="sm"
          />
        }
        actions={
          <button
            onClick={handleLoadSampleData}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs border border-cyan-500/30 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Load Sample Network CSV</span>
          </button>
        }
      />

      {/* Main Upload / Results Section */}
      {!analysisResult ? (
        <SectionCard
          title="Upload Network Traffic CSV"
          description="Select a CSV file containing network flow records for ML-powered intrusion inspection."
          icon={UploadCloud}
        >
          {/* Drag & Drop Upload Zone */}
          {!selectedFile ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-14 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-cyan-400 bg-cyan-950/20 shadow-[0_0_30px_rgba(0,242,254,0.15)]'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/30'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".csv"
                className="hidden"
              />

              <div className="mx-auto w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,242,254,0.15)]">
                <UploadCloud className="w-8 h-8 animate-bounce" />
              </div>

              <h3 className="text-base sm:text-lg font-semibold text-slate-100 font-sans mb-1">
                Upload Network Traffic CSV
              </h3>

              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-5 leading-relaxed">
                Drag and drop your network flow logs here, or click to browse from your device.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors"
                >
                  <span>Browse CSV File</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadSampleData();
                  }}
                  className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/30 transition-colors"
                >
                  <span>Use Sample Benchmark CSV</span>
                </button>
              </div>

              <p className="text-[11px] text-slate-500 mt-4 font-mono">
                Accepted format: .csv up to 50 MB (NSL-KDD compatible 41-feature network flow summaries)
              </p>
            </div>
          ) : (
            /* Selected File Information UI */
            <div className="space-y-5">
              <div className="p-5 rounded-xl border border-cyan-500/30 bg-slate-900/60 glass-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                    <FileSpreadsheet className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-100 text-sm font-mono truncate max-w-xs sm:max-w-md">
                        {fileDetails?.name}
                      </span>
                      <StatusBadge status="safe" label="Ready for ML Analysis" size="sm" />
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400 font-mono">
                      <span>Size: {fileDetails?.size}</span>
                      <span>Type: {fileDetails?.type}</span>
                      <span>Modified: {fileDetails?.lastModified}</span>
                    </div>
                  </div>
                </div>

                {/* Remove File Button */}
                <button
                  onClick={handleRemoveFile}
                  disabled={isAnalyzing}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors shrink-0 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove File</span>
                </button>
              </div>

              {/* Ready notice */}
              <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-950/15 flex items-start space-x-3 text-xs text-cyan-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-cyan-400" />
                <div>
                  <span className="font-semibold font-mono">Model Pipeline Ready:</span>
                  <p className="mt-0.5 text-slate-300">
                    Your network traffic log is staged. Clicking &quot;Analyze Traffic Now&quot; will feed the flow features into the trained Decision Tree classifier and persist the audit session in SQLite.
                  </p>
                </div>
              </div>

              {/* Analyze CTA */}
              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={handleExecuteAnalysis}
                  disabled={isAnalyzing}
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs tracking-wider uppercase font-mono shadow-[0_0_20px_rgba(0,242,254,0.3)] transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Classifying Network Flows...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Analyze Traffic Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Validation Error Banner */}
          {validationError && (
            <div className="mt-4 p-3.5 rounded-xl border border-rose-500/30 bg-rose-950/20 flex items-center space-x-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{validationError}</span>
            </div>
          )}

          {/* API Error Banner */}
          {apiError && (
            <div className="mt-4 p-4 rounded-xl border border-rose-500/40 bg-rose-950/30 text-xs text-rose-300 space-y-2">
              <div className="flex items-center space-x-2 font-semibold font-mono text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Network Flow Analysis Failed</span>
              </div>
              <p className="text-rose-300/90 pl-6">{apiError}</p>
              <div className="pl-6 pt-1">
                <button
                  onClick={handleExecuteAnalysis}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-rose-900/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-200 text-[11px] font-mono"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry Analysis</span>
                </button>
              </div>
            </div>
          )}
        </SectionCard>
      ) : (
        /* Real Analysis Results View */
        <div className="space-y-6">
          {/* Status Header Banner */}
          <div className={`p-5 rounded-2xl border glass-panel flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            analysisResult.threat_status === 'THREAT_DETECTED'
              ? 'border-rose-500/30 bg-gradient-to-r from-rose-950/30 via-slate-900/40 to-slate-950/40'
              : 'border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-slate-900/40 to-slate-950/40'
          }`}>
            <div className="flex items-center space-x-4">
              <div className={`p-3.5 rounded-xl border shrink-0 ${
                analysisResult.threat_status === 'THREAT_DETECTED'
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}>
                {analysisResult.threat_status === 'THREAT_DETECTED' ? (
                  <ShieldAlert className="w-8 h-8" />
                ) : (
                  <ShieldCheck className="w-8 h-8" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 font-sans">
                    {analysisResult.threat_status === 'THREAT_DETECTED'
                      ? 'Potential Threat Intrusions Intercepted'
                      : 'All Network Flows Classified as Normal'}
                  </h3>
                  <StatusBadge
                    status={analysisResult.threat_status === 'THREAT_DETECTED' ? 'threat' : 'safe'}
                    label={analysisResult.threat_status === 'THREAT_DETECTED' ? 'Threat Detected' : 'Benign Traffic'}
                    size="sm"
                  />
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Session #{analysisResult.session_id} &bull; File: {analysisResult.file_name} &bull; Persisted to SQLite
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 shrink-0">
              <button
                onClick={handleRemoveFile}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Analyze Another</span>
              </button>
              <Link
                to={ROUTES.RESULTS}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 text-xs font-mono border border-cyan-500/30 transition-colors"
              >
                <span>View History</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* 4 Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Flows Inspected"
              value={analysisResult.total_records.toLocaleString()}
              icon={Activity}
              subtitle="Network records evaluated"
              status="neutral"
            />
            <MetricCard
              title="Benign / Normal Traffic"
              value={analysisResult.normal_count.toLocaleString()}
              icon={ShieldCheck}
              subtitle={`${((analysisResult.normal_count / analysisResult.total_records) * 100).toFixed(1)}% of total flows`}
              status="safe"
            />
            <MetricCard
              title="Intrusion Threats Detected"
              value={analysisResult.intrusion_count.toLocaleString()}
              icon={ShieldAlert}
              subtitle={`${analysisResult.intrusion_percentage}% threat ratio`}
              status={analysisResult.intrusion_count > 0 ? 'threat' : 'safe'}
            />
            <MetricCard
              title="Avg Inference Confidence"
              value={
                analysisResult.records?.length > 0
                  ? `${(
                      analysisResult.records.reduce((acc, r) => acc + (r.confidence || 0), 0) /
                      analysisResult.records.length
                    ).toFixed(1)}%`
                  : '--'
              }
              icon={CheckCircle2}
              subtitle="Mean probability confidence"
              status="info"
            />
          </div>

          {/* Inspected Network Flow Table */}
          <SectionCard
            title="Inspected Network Flow Telemetry"
            description={`Displaying individual classified flow records from ${analysisResult.file_name}`}
            icon={Table}
          >
            <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 font-mono text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Protocol</th>
                    <th className="py-2.5 px-3">Service</th>
                    <th className="py-2.5 px-3">Flag</th>
                    <th className="py-2.5 px-3 text-right">Src Bytes</th>
                    <th className="py-2.5 px-3 text-right">Dst Bytes</th>
                    <th className="py-2.5 px-4">Prediction</th>
                    <th className="py-2.5 px-3 text-right">Confidence</th>
                    <th className="py-2.5 px-3 text-right">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
                  {analysisResult.records?.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 text-slate-500">{record.id}</td>
                      <td className="py-2.5 px-3 text-cyan-400 font-semibold uppercase">{record.protocol}</td>
                      <td className="py-2.5 px-3 text-slate-300">{record.service}</td>
                      <td className="py-2.5 px-3 text-slate-400">{record.flag}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{record.src_bytes.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{record.dst_bytes.toLocaleString()}</td>
                      <td className="py-2.5 px-4 font-sans font-semibold">
                        <StatusBadge
                          status={record.is_intrusion ? 'threat' : 'safe'}
                          label={record.prediction}
                          size="sm"
                        />
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-200">
                        {record.confidence}%
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          record.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : record.severity === 'HIGH'
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : record.severity === 'MEDIUM'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {record.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Section: Supported Data Format */}
      <SectionCard
        title="Supported Data Format & Schema"
        description="The network capture must match the network flow attributes expected by the NSL-KDD benchmark preprocessor."
        icon={Table}
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            NetGuard AI inspects network flows using 41 standard packet and connection telemetry features. Ensure your CSV captures include standard flow attributes:
          </p>

          <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/40">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 font-mono text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Feature Name</th>
                  <th className="py-2.5 px-4">Expected Type</th>
                  <th className="py-2.5 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px] text-slate-300">
                {SUPPORTED_FEATURES.map((feat) => (
                  <tr key={feat.name} className="hover:bg-slate-900/30">
                    <td className="py-2.5 px-4 text-cyan-400 font-semibold">{feat.name}</td>
                    <td className="py-2.5 px-4 text-slate-400">{feat.type}</td>
                    <td className="py-2.5 px-4 text-slate-300 font-sans text-xs">{feat.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
