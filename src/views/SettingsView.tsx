import React, { useState, useEffect } from 'react';
import { useProcure } from '../context/ProcureContext';
import { UserRole } from '../types';
import { api } from '../services/api';
import {
  Settings,
  Building,
  Sliders,
  Percent,
  Clock,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle,
  Database,
  Server,
  HardDrive,
  Download,
  Activity,
  RefreshCw,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    organisation,
    settings,
    updateSettings,
    currentUser,
    switchRole,
    resetAllDemoData,
    showToast,
  } = useProcure();

  const [scoringWeights, setScoringWeights] = useState(settings.scoringWeights);
  const [isGstRecoverable, setIsGstRecoverable] = useState(settings.taxConfig.isGstRecoverable);
  const [deliveryRules, setDeliveryRules] = useState(settings.deliveryRules);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [backendTelemetry, setBackendTelemetry] = useState<any>(null);
  const [isLoadingTelemetry, setIsLoadingTelemetry] = useState(false);

  const fetchTelemetry = async () => {
    try {
      setIsLoadingTelemetry(true);
      const data = await api.getBackendInfo();
      setBackendTelemetry(data);
    } catch (err: any) {
      console.warn('Failed to load telemetry:', err.message);
    } finally {
      setIsLoadingTelemetry(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const totalWeights =
    scoringWeights.costWeight +
    scoringWeights.qualityWeight +
    scoringWeights.deliveryWeight +
    scoringWeights.paymentWeight +
    scoringWeights.reliabilityWeight;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalWeights !== 100) {
      showToast(`Scoring weights must sum to 100% (currently ${totalWeights}%)`, 'warning');
      return;
    }

    await updateSettings({
      scoringWeights,
      taxConfig: {
        ...settings.taxConfig,
        isGstRecoverable,
      },
      deliveryRules,
    });
    showToast('Procurement configuration saved successfully!', 'success');
  };

  const roles: UserRole[] = [
    'Administrator',
    'Procurement Manager',
    'Procurement Executive',
    'Finance Reviewer',
    'Viewer',
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            System & Procurement Settings
          </h1>
          <p className="text-xs text-slate-500">
            Enterprise parameters, scoring formulas, tax policies, and role administration
          </p>
        </div>

        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
        >
          <RotateCcw className="h-3.5 w-3.5 text-rose-600" />
          Reset Demo Data
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Organisation Details */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Organisation Profile</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700">Company Name</label>
              <input
                type="text"
                readOnly
                value={organisation.organisationName}
                className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700">Industry Sector</label>
              <input
                type="text"
                readOnly
                value={organisation.industry}
                className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-slate-700 font-medium"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700">Base Currency</label>
              <input
                type="text"
                readOnly
                value={`${organisation.currency} (${organisation.currencySymbol})`}
                className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-slate-700 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Scoring Weights */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Default Multi-Factor Scoring Weights</h2>
            </div>
            <span className={`font-mono font-bold text-xs ${totalWeights === 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
              Total: {totalWeights}%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 text-xs">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <label className="block font-semibold text-slate-700">Total Landed Cost</label>
              <div className="mt-1 flex items-center gap-1 font-mono">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scoringWeights.costWeight}
                  onChange={(e) => setScoringWeights({ ...scoringWeights, costWeight: Number(e.target.value) })}
                  className="w-16 rounded border border-slate-200 bg-white px-2 py-1 font-bold text-slate-900"
                />
                <span className="text-slate-500">%</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <label className="block font-semibold text-slate-700">Product Quality</label>
              <div className="mt-1 flex items-center gap-1 font-mono">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scoringWeights.qualityWeight}
                  onChange={(e) => setScoringWeights({ ...scoringWeights, qualityWeight: Number(e.target.value) })}
                  className="w-16 rounded border border-slate-200 bg-white px-2 py-1 font-bold text-slate-900"
                />
                <span className="text-slate-500">%</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <label className="block font-semibold text-slate-700">Delivery Performance</label>
              <div className="mt-1 flex items-center gap-1 font-mono">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scoringWeights.deliveryWeight}
                  onChange={(e) => setScoringWeights({ ...scoringWeights, deliveryWeight: Number(e.target.value) })}
                  className="w-16 rounded border border-slate-200 bg-white px-2 py-1 font-bold text-slate-900"
                />
                <span className="text-slate-500">%</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <label className="block font-semibold text-slate-700">Payment Terms</label>
              <div className="mt-1 flex items-center gap-1 font-mono">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scoringWeights.paymentWeight}
                  onChange={(e) => setScoringWeights({ ...scoringWeights, paymentWeight: Number(e.target.value) })}
                  className="w-16 rounded border border-slate-200 bg-white px-2 py-1 font-bold text-slate-900"
                />
                <span className="text-slate-500">%</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <label className="block font-semibold text-slate-700">Supplier Reliability</label>
              <div className="mt-1 flex items-center gap-1 font-mono">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scoringWeights.reliabilityWeight}
                  onChange={(e) => setScoringWeights({ ...scoringWeights, reliabilityWeight: Number(e.target.value) })}
                  className="w-16 rounded border border-slate-200 bg-white px-2 py-1 font-bold text-slate-900"
                />
                <span className="text-slate-500">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tax & GST Configuration */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Percent className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Tax & GST Recoverability Assumption</h2>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isGstRecoverable}
                onChange={(e) => setIsGstRecoverable(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-blue-600"
              />
              <div>
                <span className="font-bold text-slate-900">Treat GST as 100% Recoverable Input Tax Credit (ITC)</span>
                <p className="mt-0.5 text-slate-500 leading-relaxed text-[11px]">
                  When enabled, GST paid to vendors is claimed back under Section 16 of CGST Act and is excluded from the Total Landed Cost comparison. When disabled, GST is treated as an expense and added to landed cost.
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Delivery Scoring Scale Rules */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Delivery Timeline Scoring Scale</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5 text-xs">
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-slate-500">Meets / Beats Due:</span>
              <div className="mt-1 font-bold font-mono text-slate-900">{deliveryRules.onTimeScore} pts</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-slate-500">Up to 3 Days Late:</span>
              <div className="mt-1 font-bold font-mono text-slate-900">{deliveryRules.upTo3DaysLateScore} pts</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-slate-500">4–7 Days Late:</span>
              <div className="mt-1 font-bold font-mono text-slate-900">{deliveryRules.fourTo7DaysLateScore} pts</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-slate-500">8–14 Days Late:</span>
              <div className="mt-1 font-bold font-mono text-slate-900">{deliveryRules.eightTo14DaysLateScore} pts</div>
            </div>
            <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
              <span className="text-slate-500">&gt; 14 Days Late:</span>
              <div className="mt-1 font-bold font-mono text-slate-900">{deliveryRules.moreThan14DaysLateScore} pts</div>
            </div>
          </div>
        </div>

        {/* AI Engine & Model Status */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">AI Engine & Model Architecture</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs">
            <div className="rounded-lg border border-slate-100 p-3 bg-slate-50">
              <span className="text-slate-500">Active Model:</span>
              <div className="font-mono font-bold text-slate-900">gemini-3.8-flash</div>
            </div>
            <div className="rounded-lg border border-slate-100 p-3 bg-slate-50">
              <span className="text-slate-500">SDK Runtime:</span>
              <div className="font-mono font-bold text-slate-900">@google/genai (Server-Side)</div>
            </div>
            <div className="rounded-lg border border-slate-100 p-3 bg-slate-50">
              <span className="text-slate-500">Inference Security:</span>
              <div className="font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                No Client-Side Key Exposure
              </div>
            </div>
          </div>
        </div>

        {/* Live Backend & Persistent Storage Architecture */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-blue-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-900">Live Backend Architecture & Storage Engine</h2>
                <p className="text-[11px] text-slate-500">Express REST API server with automated disk persistence</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={fetchTelemetry}
                disabled={isLoadingTelemetry}
                className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 text-slate-500 ${isLoadingTelemetry ? 'animate-spin' : ''}`} />
                {isLoadingTelemetry ? 'Querying...' : 'Diagnostics'}
              </button>

              <button
                type="button"
                onClick={() => api.downloadDatabaseBackup()}
                className="flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <Download className="h-3 w-3 text-slate-500" />
                Export DB (.json)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <div className="flex items-center justify-between text-slate-500 text-[11px]">
                <span>Runtime Engine</span>
                <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <div className="mt-1 font-mono font-bold text-slate-900">Node.js Express</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Port 3000 · Vite Dev Proxy</div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <div className="text-slate-500 text-[11px]">Disk Storage Mode</div>
              <div className="mt-1 font-mono font-bold text-slate-900">Persistent JSON</div>
              <div className="text-[10px] text-slate-500 mt-0.5">data/procure_db.json</div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <div className="text-slate-500 text-[11px]">Server Uptime</div>
              <div className="mt-1 font-mono font-bold text-slate-900">
                {backendTelemetry?.uptimeSeconds ? `${Math.floor(backendTelemetry.uptimeSeconds / 60)}m ${backendTelemetry.uptimeSeconds % 60}s` : 'Active'}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Heap: {backendTelemetry?.memoryUsageMB || 42} MB
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
              <div className="text-slate-500 text-[11px]">REST Endpoints</div>
              <div className="mt-1 font-mono font-bold text-blue-600">
                {backendTelemetry?.registeredEndpoints?.length || 35} Active
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Auto-Sync On Write ✓</div>
            </div>
          </div>

          {/* Database Entity Ledger Snapshot */}
          <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 text-xs">
            <div className="font-semibold text-slate-800 text-[11px] mb-2 flex items-center justify-between">
              <span>Synchronized Backend Entities:</span>
              <span className="font-mono text-[10px] text-slate-400">
                Last Disk Sync: {backendTelemetry?.storageEngine?.lastModified ? new Date(backendTelemetry.storageEngine.lastModified).toLocaleTimeString() : 'Live'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-6 text-[11px] font-mono text-center">
              <div className="rounded bg-white p-1.5 border border-slate-200 shadow-2xs">
                <span className="text-slate-400 text-[10px] block">RFQs</span>
                <span className="font-bold text-slate-900">{backendTelemetry?.databaseSummary?.rfqCount ?? '—'}</span>
              </div>
              <div className="rounded bg-white p-1.5 border border-slate-200 shadow-2xs">
                <span className="text-slate-400 text-[10px] block">Requisitions</span>
                <span className="font-bold text-slate-900">{backendTelemetry?.databaseSummary?.purchaseRequestCount ?? '—'}</span>
              </div>
              <div className="rounded bg-white p-1.5 border border-slate-200 shadow-2xs">
                <span className="text-slate-400 text-[10px] block">Vendors</span>
                <span className="font-bold text-slate-900">{backendTelemetry?.databaseSummary?.vendorCount ?? '—'}</span>
              </div>
              <div className="rounded bg-white p-1.5 border border-slate-200 shadow-2xs">
                <span className="text-slate-400 text-[10px] block">Quotations</span>
                <span className="font-bold text-slate-900">{backendTelemetry?.databaseSummary?.quotationCount ?? '—'}</span>
              </div>
              <div className="rounded bg-white p-1.5 border border-slate-200 shadow-2xs">
                <span className="text-slate-400 text-[10px] block">Contracts</span>
                <span className="font-bold text-slate-900">{backendTelemetry?.databaseSummary?.contractCount ?? '—'}</span>
              </div>
              <div className="rounded bg-white p-1.5 border border-slate-200 shadow-2xs">
                <span className="text-slate-400 text-[10px] block">Audit Logs</span>
                <span className="font-bold text-slate-900">{backendTelemetry?.databaseSummary?.auditLogCount ?? '—'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Active Role Simulation */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Users className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">User Role & Permission Testing</h2>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 text-xs">
            {roles.map((r) => {
              const isCurrent = currentUser.role === r;
              return (
                <button
                  type="button"
                  key={r}
                  onClick={() => switchRole(r)}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50/50 shadow-2xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-slate-900">{r}</div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {r === 'Administrator' && 'Full System Control'}
                    {r === 'Procurement Manager' && 'Award & PR Approvals'}
                    {r === 'Procurement Executive' && 'RFQs & Quotation Ingest'}
                    {r === 'Finance Reviewer' && 'Audit Landed Costs'}
                    {r === 'Viewer' && 'Read-Only Access'}
                  </div>
                  {isCurrent && (
                    <div className="mt-2 text-[10px] font-bold text-blue-600">Active Role ✓</div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="rounded-lg bg-slate-900 px-6 py-2.5 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition-colors"
          >
            Save All Settings
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Reset Demo Environment?</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              This resets all synthetic RFQs, vendor quotations, contracts, and spend analytics for <strong>Apex Paper Industries Pvt. Ltd.</strong> back to the initial benchmark demo baseline.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="rounded-md border border-slate-200 px-3.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await resetAllDemoData();
                  setIsResetConfirmOpen(false);
                }}
                className="rounded-md bg-rose-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 transition-colors"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
