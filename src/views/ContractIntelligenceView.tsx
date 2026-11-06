import React, { useState } from 'react';
import { useProcure } from '../context/ProcureContext';
import { Contract, ContractClause } from '../types';
import { api } from '../services/api';
import {
  ScrollText,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  FileText,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  Clock,
  Building,
  Info,
} from 'lucide-react';

export const ContractIntelligenceView: React.FC = () => {
  const { contracts, vendors, createContract, updateContract, showToast } = useProcure();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(contracts[0] || null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // New Contract Form State
  const [newContractForm, setNewContractForm] = useState({
    vendorId: vendors[0]?.vendorId || 'vnd-beta',
    contractTitle: 'Annual Master Supply Agreement',
    contractNumber: `MSA-2026-${Date.now().toString().slice(-4)}`,
    contractValue: 12000000,
    effectiveDate: '2026-01-01',
    expiryDate: '2026-12-31',
    paymentTerms: '45 Days Net against invoice',
    contractText: `MASTER SUPPLY AGREEMENT
Between: Apex Paper Industries Pvt. Ltd. and Supplier
Clause 1: Scope of Raw Material Supply
Clause 2: Payment within 45 days. 
Clause 3: Penalty for delay is 0.5% per week up to 5% maximum.
Clause 4: Warranty period is 12 months for burst strength.
Clause 5: Advance notice of 60 days required for renewal.`,
  });

  const filteredContracts = contracts.filter((c) => {
    const matchesSearch =
      c.contractTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.reviewStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUploadAndAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find(v => v.vendorId === newContractForm.vendorId);
    try {
      setIsAnalyzing(true);
      const aiResult = await api.reviewContractWithGemini({
        contractTitle: newContractForm.contractTitle,
        vendorName: vendor?.vendorName || 'Supplier',
        contractText: newContractForm.contractText,
      });

      const created = await createContract({
        vendorId: newContractForm.vendorId,
        vendorName: vendor?.vendorName || 'Supplier',
        contractTitle: newContractForm.contractTitle,
        contractNumber: newContractForm.contractNumber,
        contractValue: newContractForm.contractValue,
        effectiveDate: newContractForm.effectiveDate,
        expiryDate: newContractForm.expiryDate,
        paymentTerms: newContractForm.paymentTerms,
        deliveryObligations: 'Delivery within 12 days DDP Vapi Works',
        penaltyClausesSummary: '0.5% per week up to 5% max cap',
        warrantyPeriod: '12 Months quality warranty',
        renewalNoticeDays: 45,
        extractedClauses: aiResult.extractedClauses || [],
        riskFindings: aiResult.riskFindings || [],
        reviewStatus: aiResult.riskFindings?.length > 1 ? 'Needs Amendment' : 'Under Legal Review',
      });

      setSelectedContract(created);
      setIsUploadModalOpen(false);
      showToast('Contract uploaded and audited with Gemini AI!', 'success');
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusBadge = (status: Contract['reviewStatus']) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Needs Amendment':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Under Legal Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Expired':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getRiskSeverityBadge = (severity: 'Low' | 'Medium' | 'High') => {
    switch (severity) {
      case 'High':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Contract Intelligence & Commercial Risk Review
          </h1>
          <p className="text-xs text-slate-500">
            Automated clause extraction, unfavorable condition auditing & upcoming expiry warnings
          </p>
        </div>

        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Upload New Agreement
        </button>
      </div>

      {/* Legal Review Disclaimer */}
      <div className="rounded-lg bg-amber-50/60 p-3 text-xs border border-amber-200 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-amber-900 leading-relaxed text-[11px]">
          <strong>Advisory Note:</strong> AI contract risk findings are designed to assist procurement teams in identifying commercial liabilities, penalty exposure, and unfavorable terms. They are advisory and do not substitute formal legal review.
        </div>
      </div>

      {/* Main 2-Column Interface: Contracts List (Left) & Detailed Clause Audit (Right) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Contracts Master List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search contracts or vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 pl-9 pr-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-lg">
              {['All', 'Approved', 'Needs Amendment', 'Under Legal Review'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`rounded-md px-2 py-1 text-[11px] font-medium whitespace-nowrap transition-colors ${
                    statusFilter === st ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredContracts.map((c) => {
              const isSelected = selectedContract?.contractId === c.contractId;
              const isExpiringSoon = new Date(c.expiryDate).getTime() - Date.now() < 60 * 86400000;
              return (
                <div
                  key={c.contractId}
                  onClick={() => setSelectedContract(c)}
                  className={`cursor-pointer rounded-xl border p-4 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/30 shadow-xs ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[11px] font-semibold text-blue-600">{c.contractNumber}</span>
                      <h3 className="mt-0.5 text-xs font-bold text-slate-900 leading-snug">{c.contractTitle}</h3>
                      <div className="text-[11px] text-slate-500 font-medium">{c.vendorName}</div>
                    </div>

                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(c.reviewStatus)}`}>
                      {c.reviewStatus}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-600">
                    <span className="font-mono font-semibold text-slate-900">
                      ₹{(c.contractValue / 100000).toFixed(1)} Lakhs
                    </span>

                    <div className="flex items-center gap-1 font-mono">
                      <Clock className="h-3 w-3 text-slate-400" />
                      <span className={isExpiringSoon ? 'text-rose-600 font-bold' : ''}>
                        Exp: {c.expiryDate}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Clause & AI Risk Findings (7 cols) */}
        <div className="lg:col-span-7">
          {selectedContract ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-2xs space-y-6">
              {/* Header Info */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">{selectedContract.contractNumber}</span>
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${getStatusBadge(selectedContract.reviewStatus)}`}>
                      {selectedContract.reviewStatus}
                    </span>
                  </div>
                  <h2 className="mt-1 text-base font-bold text-slate-900">{selectedContract.contractTitle}</h2>
                  <div className="text-xs text-slate-600">Contractor: <strong>{selectedContract.vendorName}</strong></div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-500">Contract Value</span>
                  <div className="text-lg font-bold font-mono text-slate-900">
                    ₹{selectedContract.contractValue.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Key Commercial Terms Grid */}
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-4 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-500">Effective Date:</span>
                  <div className="font-semibold text-slate-800 font-mono">{selectedContract.effectiveDate}</div>
                </div>
                <div>
                  <span className="text-slate-500">Expiration Date:</span>
                  <div className="font-semibold text-slate-800 font-mono">{selectedContract.expiryDate}</div>
                </div>
                <div>
                  <span className="text-slate-500">Payment Terms:</span>
                  <div className="font-semibold text-slate-800">{selectedContract.paymentTerms}</div>
                </div>
                <div>
                  <span className="text-slate-500">Liquidated Damages:</span>
                  <div className="font-semibold text-slate-800">{selectedContract.penaltyClausesSummary}</div>
                </div>
              </div>

              {/* AI Identified Commercial & Legal Risks */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                  Identified Commercial Risks & Ambiguities
                </h3>

                {selectedContract.riskFindings.length === 0 ? (
                  <div className="mt-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 border border-emerald-200">
                    ✓ No high-risk clauses or critical liabilities detected in this agreement draft.
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    {selectedContract.riskFindings.map((risk, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-lg bg-rose-50/60 p-3 border border-rose-200 text-xs text-rose-900">
                        <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">{risk}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Extracted Core Clauses */}
              <div>
                <h3 className="text-sm font-bold text-slate-900">Extracted Core Provisions</h3>
                <div className="mt-3 divide-y divide-slate-100">
                  {selectedContract.extractedClauses.map((clause, idx) => (
                    <div key={idx} className="py-3 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{clause.clauseTitle}</span>
                        <div className="flex items-center gap-2">
                          {clause.pageReference && (
                            <span className="font-mono text-[10px] text-slate-400">{clause.pageReference}</span>
                          )}
                          <span className={`rounded border px-1.5 py-0.5 text-[10px] font-semibold ${getRiskSeverityBadge(clause.riskSeverity)}`}>
                            {clause.riskSeverity} Risk
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{clause.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4">
                <button
                  onClick={() => updateContract(selectedContract.contractId, { reviewStatus: 'Approved' })}
                  className="rounded-md bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Approve Contract
                </button>
                <button
                  onClick={() => updateContract(selectedContract.contractId, { reviewStatus: 'Needs Amendment' })}
                  className="rounded-md border border-rose-200 bg-rose-50 px-3.5 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                >
                  Flag for Amendment
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
              <ScrollText className="mx-auto h-8 w-8 text-slate-300" />
              <h3 className="mt-2 text-sm font-bold text-slate-900">Select an Agreement</h3>
              <p className="mt-1 text-xs text-slate-500">
                Choose a contract from the list to review extracted clauses and AI risk findings.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload New Agreement Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Upload Supplier Contract for AI Review</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleUploadAndAnalyze} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700">Contract Title *</label>
                <input
                  type="text"
                  required
                  value={newContractForm.contractTitle}
                  onChange={(e) => setNewContractForm({ ...newContractForm, contractTitle: e.target.value })}
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Vendor</label>
                  <select
                    value={newContractForm.vendorId}
                    onChange={(e) => setNewContractForm({ ...newContractForm, vendorId: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                  >
                    {vendors.map(v => (
                      <option key={v.vendorId} value={v.vendorId}>{v.vendorName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Contract Value (₹)</label>
                  <input
                    type="number"
                    value={newContractForm.contractValue}
                    onChange={(e) => setNewContractForm({ ...newContractForm, contractValue: Number(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700">Effective Date</label>
                  <input
                    type="date"
                    value={newContractForm.effectiveDate}
                    onChange={(e) => setNewContractForm({ ...newContractForm, effectiveDate: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700">Expiry Date</label>
                  <input
                    type="date"
                    value={newContractForm.expiryDate}
                    onChange={(e) => setNewContractForm({ ...newContractForm, expiryDate: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700">Contract Text or Clauses for AI Ingestion</label>
                <textarea
                  rows={4}
                  value={newContractForm.contractText}
                  onChange={(e) => setNewContractForm({ ...newContractForm, contractText: e.target.value })}
                  placeholder="Paste agreement text or clauses..."
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 font-mono text-[11px] focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="mt-5 flex justify-end gap-2.5 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="rounded-md border border-slate-200 px-3.5 py-1.5 text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAnalyzing}
                  className="flex items-center gap-1.5 rounded-md bg-blue-600 px-4 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {isAnalyzing ? 'Auditing Clauses...' : 'Audit with Gemini'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
