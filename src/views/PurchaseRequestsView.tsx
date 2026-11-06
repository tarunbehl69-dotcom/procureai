import React, { useState } from 'react';
import { useProcure } from '../context/ProcureContext';
import { PurchaseRequest, PurchaseRequestStatus } from '../types';
import {
  Search,
  Filter,
  Plus,
  ArrowRight,
  CheckCircle,
  XCircle,
  FileText,
  Clock,
  Layers,
  Calendar,
} from 'lucide-react';

interface PurchaseRequestsViewProps {
  onConvertToRfq: (pr: PurchaseRequest) => void;
}

export const PurchaseRequestsView: React.FC<PurchaseRequestsViewProps> = ({ onConvertToRfq }) => {
  const {
    purchaseRequests,
    createPurchaseRequest,
    updatePurchaseRequest,
    hasPermission,
    showToast,
  } = useProcure();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedPr, setSelectedPr] = useState<PurchaseRequest | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New PR form state
  const [formData, setFormData] = useState({
    materialName: '',
    category: 'Paper & Board',
    quantity: 1000,
    unit: 'units',
    budget: 500000,
    requiredDeliveryDate: '2026-12-15',
    specifications: '',
    remarks: '',
  });

  const categories = [
    'Paper & Board',
    'Raw Pulp & Fiber',
    'Chemical Additives',
    'Packaging & Logistics',
    'Printing & Inks',
  ];

  const filtered = purchaseRequests.filter((pr) => {
    const matchesSearch =
      pr.requestNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.materialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pr.requestedBy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || pr.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.materialName) {
      showToast('Please enter material or product name', 'warning');
      return;
    }
    await createPurchaseRequest(formData);
    setIsCreateModalOpen(false);
    setFormData({
      materialName: '',
      category: 'Paper & Board',
      quantity: 1000,
      unit: 'units',
      budget: 500000,
      requiredDeliveryDate: '2026-12-15',
      specifications: '',
      remarks: '',
    });
  };

  const getStatusBadge = (status: PurchaseRequestStatus) => {
    switch (status) {
      case 'Approved':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Submitted':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Under Review':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Converted to RFQ':
        return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'Rejected':
        return 'text-rose-700 bg-rose-50 border-rose-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Purchase Request Management
          </h1>
          <p className="text-xs text-slate-500">
            Requisition approval workflows and RFQ conversion gateway
          </p>
        </div>

        {hasPermission('CREATE_PR') && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Purchase Request
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by PR number, material name, or requester..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-lg shrink-0">
          {['All', 'Submitted', 'Under Review', 'Approved', 'Converted to RFQ', 'Draft'].map((st) => (
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

      {/* Purchase Requests Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 font-semibold text-slate-700">
              <tr>
                <th className="px-4 py-3">PR Number</th>
                <th className="px-4 py-3">Material & Category</th>
                <th className="px-4 py-3 text-right">Quantity</th>
                <th className="px-4 py-3 text-right">Estimated Budget</th>
                <th className="px-4 py-3">Required Delivery</th>
                <th className="px-4 py-3">Requested By</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((pr) => (
                <tr key={pr.requestId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                    {pr.requestNumber}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{pr.materialName}</div>
                    <div className="text-[11px] text-slate-500">{pr.category}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-medium">
                    {pr.quantity.toLocaleString('en-IN')} {pr.unit}
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                    ₹{pr.budget.toLocaleString('en-IN')}
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                    {pr.requiredDeliveryDate}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{pr.requestedBy}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getStatusBadge(pr.status)}`}>
                      {pr.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedPr(pr)}
                      className="rounded border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                    >
                      View
                    </button>

                    {pr.status === 'Approved' && (
                      <button
                        onClick={() => onConvertToRfq(pr)}
                        className="rounded bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white hover:bg-slate-800 transition-colors"
                      >
                        Convert to RFQ
                      </button>
                    )}

                    {pr.status === 'Under Review' && hasPermission('APPROVE_PR') && (
                      <>
                        <button
                          onClick={() => updatePurchaseRequest(pr.requestId, { status: 'Approved' })}
                          className="rounded bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => updatePurchaseRequest(pr.requestId, { status: 'Rejected' })}
                          className="rounded bg-rose-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-rose-700"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Purchase Request Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Create New Purchase Request</h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">Material or Product Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.materialName}
                    onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                    placeholder="e.g. Bleached Chemical Pulp 88% ISO"
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Procurement Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Required Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Unit of Measurement</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="units, MT, kg, rolls"
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">Target Delivery Date</label>
                  <input
                    type="date"
                    value={formData.requiredDeliveryDate}
                    onChange={(e) => setFormData({ ...formData, requiredDeliveryDate: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">Technical Specifications</label>
                  <textarea
                    rows={2}
                    value={formData.specifications}
                    onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                    placeholder="Enter technical specifications, GSM, tensile strength, purity..."
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700">Remarks / Business Justification</label>
                  <input
                    type="text"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="e.g. Critical stock replenishment for packaging run"
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
                  className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition-colors"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PR Details View Modal */}
      {selectedPr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600">{selectedPr.requestNumber}</span>
                <h3 className="text-sm font-bold text-slate-900">{selectedPr.materialName}</h3>
              </div>
              <button onClick={() => setSelectedPr(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-slate-500">Category:</span>
                  <div className="font-semibold text-slate-800">{selectedPr.category}</div>
                </div>
                <div>
                  <span className="text-slate-500">Requested Quantity:</span>
                  <div className="font-semibold text-slate-800 font-mono">{selectedPr.quantity} {selectedPr.unit}</div>
                </div>
                <div>
                  <span className="text-slate-500">Budget:</span>
                  <div className="font-semibold text-slate-800 font-mono">₹{selectedPr.budget.toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <span className="text-slate-500">Target Delivery:</span>
                  <div className="font-semibold text-slate-800 font-mono">{selectedPr.requiredDeliveryDate}</div>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-700">Specifications:</span>
                <p className="mt-1 rounded border border-slate-100 bg-slate-50 p-2 text-slate-600">
                  {selectedPr.specifications || 'Standard specifications as per catalogue.'}
                </p>
              </div>

              {selectedPr.remarks && (
                <div>
                  <span className="font-semibold text-slate-700">Remarks:</span>
                  <p className="mt-1 text-slate-600">{selectedPr.remarks}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setSelectedPr(null)}
                className="rounded-md border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              {selectedPr.status === 'Approved' && (
                <button
                  onClick={() => {
                    const pr = selectedPr;
                    setSelectedPr(null);
                    onConvertToRfq(pr);
                  }}
                  className="rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  Convert to RFQ
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
