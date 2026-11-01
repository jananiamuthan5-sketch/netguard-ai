import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileCheck,
  FileX,
  AlertCircle,
  FileSpreadsheet,
  Trash2,
  Play,
  Info,
  CheckCircle2,
  Table,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SectionCard from '../components/SectionCard';
import StatusBadge from '../components/StatusBadge';
import { SUPPORTED_FEATURES } from '../utils/constants';

export default function AnalyzePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [fileDetails, setFileDetails] = useState(null);
  const fileInputRef = useRef(null);

  // File validator
  const handleValidateAndSetFile = (file) => {
    setValidationError(null);
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setValidationError('Invalid file type. Please upload a CSV (.csv) network flow log file.');
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Analyze Network Traffic"
        description="Upload network traffic data for AI-powered intrusion analysis."
        badge={<StatusBadge status="info" label="Data Ingestion" size="sm" />}
      />

      {/* Main Upload Section */}
      <SectionCard
        title="Upload Network Traffic CSV"
        description="Select a CSV file containing supported network-flow data."
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

            <p className="text-[11px] text-slate-500 mt-4 font-mono">
              Accepted format: .csv (network packet flow summaries)
            </p>
          </div>
        ) : (
          /* Selected File Information UI */
          <div className="space-y-4">
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
                    <StatusBadge status="safe" label="Valid CSV" size="sm" />
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
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove File</span>
              </button>
            </div>

            {/* Analysis Action Notice (Required by Phase 2 rules) */}
            <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-950/10 flex items-start space-x-3 text-xs text-amber-300">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <span className="font-semibold font-mono">Phase 2 Notice:</span>
                <p className="mt-0.5 text-slate-400">
                  Local CSV file selection and schema validation is active. Analysis functionality will be connected in Phase 7 when the backend inference pipeline is deployed.
                </p>
              </div>
            </div>

            {/* Analyze Traffic CTA (Disabled per Phase 2 rules) */}
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                disabled
                title="Analysis functionality will be connected in Phase 7."
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-slate-800 text-slate-500 border border-slate-700/80 cursor-not-allowed text-xs font-semibold font-mono tracking-wide"
              >
                <Play className="w-4 h-4" />
                <span>Analyze Traffic (Phase 7)</span>
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
      </SectionCard>

      {/* Section: Supported Data Format */}
      <SectionCard
        title="Supported Data Format"
        description="The uploaded CSV must match the network flow features expected by the trained ML model."
        icon={Table}
      >
        <div className="space-y-4">
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            NetGuard AI classifies network traffic using standard flow telemetry features consistent with cybersecurity intrusion benchmarks (such as NSL-KDD and CIC-IDS). Ensure your CSV includes the following attribute columns:
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

          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/40 font-mono text-xs text-slate-400 space-y-1">
            <div className="text-slate-300 font-semibold flex items-center space-x-1.5 mb-1.5">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Sample CSV Header Schema</span>
            </div>
            <pre className="p-2.5 bg-slate-950 rounded border border-slate-800/80 overflow-x-auto text-[11px] text-cyan-300">
              duration,protocol_type,service,flag,src_bytes,dst_bytes,count,srv_count,serror_rate,dst_host_count
            </pre>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
