import React, { useState } from 'react';
import { useProcure } from '../context/ProcureContext';
import { RFQ, RfqStatus } from '../types';
import { NavItemKey } from '../components/layout/Sidebar';
import {
  Search,
  Plus,
  ArrowRight,
  UploadCloud,
  GitCompare,
  Sparkles,
  Calendar,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface RfqManagementViewProps {
  onNavigate: (key: NavItemKey) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const RfqManagementView: React.FC<RfqManagementViewProps> = ({
  onNavigate,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  const {
    rfqs,
    createRfq,
    updateRfq,
    vendors,
    quotations,
    selectedRfqId,
    setSelectedRfqId,
    purchaseRequests,
    hasPermission,
    showToast,
  } = useProcure();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedRfqDetail, setSelectedRfqDetail] = useState<RFQ | null>(null);

  // Form State for New RFQ
  const [rfqForm, setRfqForm] = useState({
    title: '',
    category: 'Paper & Board',
    quantity: 10000,
    unit: 'units',
    selectedVendorIds: ['vnd-alpha', 'vnd-beta', 'vnd-gamma'],
    submissionDeadline: '2026-11-25',
    requiredDeliveryDate: '2026-12-05',
    deliveryLeadTimeDays: 15,
    description: '',
    commercialConditions: 'Delivery DDP Vapi Works. 18% GST with Input Tax Credit eligibility. Payment against inspection report.',
    purchaseRequestId: '',
  });

  const filteredRfqs = rfqs.filter((r) => {
    const matchesSearch =
      r.rfqNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfqForm.title) {
      showToast('Please provide an RFQ title', 'warning');
      return;
    }
    if (rfqForm.selectedVendorIds.length === 0) {
      showToast('Please select at least one vendor to invite', 'warning');
      return;
    }
    const created = await createRfq(rfqForm);
    setIsCreateModalOpen(false);
    setSelectedRfqDetail(created);
  };

  const getStatusBadge = (status: RfqStatus) => {
    switch (status) {
      case 'Responses Received':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Evaluation in Progress':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Completed':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Sent':
      case 'Awaiting Response':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Cancelled':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Request for Quotation (RFQ) Management
          </h1>
          <p className="text-xs text-slate-500">
            Multi-vendor sourcing tenders, deadline tracking, and submission monitoring
          </p>
        </div>

        {hasPermission('CREATE_RFQ') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create RFQ
          </button>
        )}
      </div>

      {/* Search & Status Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by RFQ number, title, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-lg shrink-0">
          {['All', 'Responses Received', 'Awaiting Response', 'Sent', 'Completed', 'Draft'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* RFQ Grid Cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {filteredRfqs.map((rfq) => {
          const rfqQuotes = quotations.filter((q) => q.rfqId === rfq.rfqId);
          const isCurrentActive = selectedRfqId === rfq.rfqId;

          return (
            <div
              key={rfq.rfqId}
              className={`rounded-xl border bg-white p-5 shadow-2xs transition-all ${
                isCurrentActive ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600">{rfq.rfqNumber}</span>
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getStatusBadge(rfq.status)}`}>
                      {rfq.status}
                    </span>
                  </div>
                  <h3 className="mt-1 text-sm font-bold text-slate-900 leading-snug">{rfq.title}</h3>
                </div>

                <button
                  onClick={() => {
                    setSelectedRfqId(rfq.rfqId);
                    setSelectedRfqDetail(rfq);
                  }}
                  className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 shrink-0"
                >
                  Details
                </button>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-xs border border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-500">Quantity</span>
                  <div className="font-mono font-semibold text-slate-900">
                    {rfq.quantity.toLocaleString('en-IN')} {rfq.unit}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Submission Due</span>
                  <div className="font-mono font-medium text-slate-700">
                    {rfq.submissionDeadline}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Lead Time Target</span>
                  <div className="font-mono font-semibold text-slate-900">
                    {rfq.deliveryLeadTimeDays} Days
                  </div>
                </div>
              </div>

              {/* Vendor & Quotation Summary Strip */}
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <div className="flex items-center gap-3 text-slate-600">
                  <span>
                    <strong className="text-slate-900">{rfq.selectedVendorIds.length}</strong> Invited Vendors
                  </span>
                  <span>·</span>
                  <span>
                    <strong className="text-slate-900">{rfqQuotes.length}</strong> Quotes Uploaded
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedRfqId(rfq.rfqId);
                      onNavigate('quotation-analysis');
                    }}
                    title="Upload Quotation"
                    className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <UploadCloud className="h-3 w-3 text-blue-600" />
                    Upload
                  </button>

                  <button
                    onClick={() => {
                      setSelectedRfqId(rfq.rfqId);
                      onNavigate('vendor-comparison');
                    }}
                    className="flex items-center gap-1 rounded-md bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                  >
                    Compare
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create RFQ Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Request for Quotation (RFQ)</h3>
                <p className="text-xs text-slate-500">Auto-assigns RFQ number and distributes to selected suppliers</p>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateRfqSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">RFQ Title *</label>
                  <input
                    type="text"
                    required
                    value={rfqForm.title}
                    onChange={(e) => setRfqForm({ ...rfqForm, title: e.target.value })}
                    placeholder="e.g. Bulk Procurement of Industrial Packaging Paper (180 GSM)"
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={rfqForm.category}
                    onChange={(e) => setRfqForm({ ...rfqForm, category: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Paper & Board">Paper & Board</option>
                    <option value="Raw Pulp & Fiber">Raw Pulp & Fiber</option>
                    <option value="Chemical Additives">Chemical Additives</option>
                    <option value="Packaging & Logistics">Packaging & Logistics</option>
                    <option value="Printing & Inks">Printing & Inks</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Link Approved Purchase Request</label>
                  <select
                    value={rfqForm.purchaseRequestId}
                    onChange={(e) => {
                      const prId = e.target.value;
                      const matched = purchaseRequests.find(p => p.requestId === prId);
                      if (matched) {
                        setRfqForm({
                          ...rfqForm,
                          purchaseRequestId: prId,
                          title: `Procurement of ${matched.materialName}`,
                          category: matched.category,
                          quantity: matched.quantity,
                          unit: matched.unit,
                        });
                      } else {
                        setRfqForm({ ...rfqForm, purchaseRequestId: prId });
                      }
                    }}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">-- None (Standalone RFQ) --</option>
                    {purchaseRequests.filter(p => p.status === 'Approved').map(pr => (
                      <option key={pr.requestId} value={pr.requestId}>
                        {pr.requestNumber} – {pr.materialName} ({pr.quantity} {pr.unit})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Required Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={rfqForm.quantity}
                    onChange={(e) => setRfqForm({ ...rfqForm, quantity: Number(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Unit of Measurement</label>
                  <input
                    type="text"
                    value={rfqForm.unit}
                    onChange={(e) => setRfqForm({ ...rfqForm, unit: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Submission Due Date</label>
                  <input
                    type="date"
                    value={rfqForm.submissionDeadline}
                    onChange={(e) => setRfqForm({ ...rfqForm, submissionDeadline: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Target Lead Time (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={rfqForm.deliveryLeadTimeDays}
                    onChange={(e) => setRfqForm({ ...rfqForm, deliveryLeadTimeDays: Number(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                {/* Vendor Multi-Selection */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">Invite Vendors from Directory *</label>
                  <div className="mt-1 max-h-36 overflow-y-auto rounded-md border border-slate-200 p-2 space-y-1.5 bg-slate-50">
                    {vendors.map((v) => {
                      const isChecked = rfqForm.selectedVendorIds.includes(v.vendorId);
                      return (
                        <label key={v.vendorId} className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRfqForm({
                                  ...rfqForm,
                                  selectedVendorIds: [...rfqForm.selectedVendorIds, v.vendorId],
                                });
                              } else {
                                setRfqForm({
                                  ...rfqForm,
                                  selectedVendorIds: rfqForm.selectedVendorIds.filter(id => id !== v.vendorId),
                                });
                              }
                            }}
                            className="rounded text-blue-600 focus:ring-blue-500"
                          />
                          <span className="font-medium">{v.vendorName}</span>
                          <span className="text-[11px] text-slate-500">({v.category} · QA {v.qualityRating}/100)</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">Commercial & Delivery Conditions</label>
                  <textarea
                    rows={2}
                    value={rfqForm.commercialConditions}
                    onChange={(e) => setRfqForm({ ...rfqForm, commercialConditions: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2.5 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-md border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Publish RFQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RFQ Detail Modal */}
      {selectedRfqDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600">{selectedRfqDetail.rfqNumber}</span>
                <h3 className="text-sm font-bold text-slate-900">{selectedRfqDetail.title}</h3>
              </div>
              <button onClick={() => setSelectedRfqDetail(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-500">Status:</span>
                  <div className="font-semibold text-slate-800">{selectedRfqDetail.status}</div>
                </div>
                <div>
                  <span className="text-slate-500">Required Quantity:</span>
                  <div className="font-semibold text-slate-800 font-mono">{selectedRfqDetail.quantity.toLocaleString('en-IN')} {selectedRfqDetail.unit}</div>
                </div>
                <div>
                  <span className="text-slate-500">Target Lead Time:</span>
                  <div className="font-semibold text-slate-800 font-mono">{selectedRfqDetail.deliveryLeadTimeDays} Days</div>
                </div>
                <div>
                  <span className="text-slate-500">Submission Due:</span>
                  <div className="font-semibold text-slate-800 font-mono">{selectedRfqDetail.submissionDeadline}</div>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700">Commercial Conditions:</span>
                <p className="mt-1 rounded border border-slate-100 bg-slate-50 p-2 text-slate-600">
                  {selectedRfqDetail.commercialConditions}
                </p>
              </div>

              <div>
                <span className="font-semibold text-slate-700">Invited Vendors:</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {selectedRfqDetail.selectedVendorIds.map((vid) => {
                    const v = vendors.find(item => item.vendorId === vid);
                    return (
                      <span key={vid} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700">
                        {v?.vendorName || vid}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setSelectedRfqDetail(null)}
                className="rounded-md border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedRfqId(selectedRfqDetail.rfqId);
                  setSelectedRfqDetail(null);
                  onNavigate('vendor-comparison');
                }}
                className="rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
              >
                Open Comparison Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
