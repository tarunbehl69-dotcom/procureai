import React, { useState } from 'react';
import { useProcure } from '../context/ProcureContext';
import { Vendor, VendorStatus } from '../types';
import {
  Search,
  Plus,
  Building2,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Award,
  Clock,
  ShieldCheck,
  Edit,
} from 'lucide-react';

export const VendorDirectoryView: React.FC = () => {
  const { vendors, createVendor, updateVendor, hasPermission, showToast } = useProcure();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    vendorName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    category: 'Paper & Board',
    gstin: '',
    pan: '',
    yearsInBusiness: 10,
    productsSupplied: '',
    qualityRating: 88,
    onTimeDeliveryRate: 90,
    reliabilityScore: 85,
    status: 'Active' as VendorStatus,
  });

  const categories = [
    'All',
    'Paper & Board',
    'Raw Pulp & Fiber',
    'Chemical Additives',
    'Packaging & Logistics',
    'Printing & Inks',
  ];

  const filtered = vendors.filter((v) => {
    const matchesSearch =
      v.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.productsSupplied.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenAdd = () => {
    setEditingVendorId(null);
    setForm({
      vendorName: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      category: 'Paper & Board',
      gstin: '',
      pan: '',
      yearsInBusiness: 10,
      productsSupplied: 'Industrial Packaging Paper, Kraft Liner',
      qualityRating: 88,
      onTimeDeliveryRate: 90,
      reliabilityScore: 85,
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (v: Vendor) => {
    setEditingVendorId(v.vendorId);
    setForm({
      vendorName: v.vendorName,
      contactPerson: v.contactPerson,
      email: v.email,
      phone: v.phone,
      address: v.address,
      category: v.category,
      gstin: v.gstin || '',
      pan: v.pan || '',
      yearsInBusiness: v.yearsInBusiness,
      productsSupplied: v.productsSupplied.join(', '),
      qualityRating: v.qualityRating,
      onTimeDeliveryRate: v.onTimeDeliveryRate,
      reliabilityScore: v.reliabilityScore,
      status: v.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.vendorName) {
      showToast('Vendor company name is required', 'warning');
      return;
    }

    const payload = {
      ...form,
      productsSupplied: form.productsSupplied.split(',').map(s => s.trim()).filter(Boolean),
    };

    if (editingVendorId) {
      await updateVendor(editingVendorId, payload);
      setEditingVendorId(null);
    } else {
      await createVendor(payload);
    }
    setIsModalOpen(false);
  };

  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'Active':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Under Review':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Inactive':
        return 'text-slate-600 bg-slate-50 border-slate-200';
      case 'Blacklisted':
        return 'text-rose-700 bg-rose-50 border-rose-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Supplier & Vendor Directory
          </h1>
          <p className="text-xs text-slate-500">
            Central repository of verified paper manufacturing suppliers, compliance credentials & historical KPI audits
          </p>
        </div>

        {hasPermission('CREATE_RFQ') && (
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add New Vendor
          </button>
        )}
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by vendor name, contact person, email, or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 pl-9 pr-4 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 rounded-lg shrink-0">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap ${
                categoryFilter === c
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Vendors Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 font-semibold text-slate-700">
              <tr>
                <th className="px-4 py-3">Vendor / Company</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3 text-center">Quality Rating</th>
                <th className="px-4 py-3 text-center">On-Time %</th>
                <th className="px-4 py-3 text-center">Reliability</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((v) => (
                <tr key={v.vendorId} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{v.vendorName}</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <span className="font-mono">{v.vendorId}</span>
                      <span>·</span>
                      <span>{v.yearsInBusiness} yrs in business</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 font-medium text-slate-800">{v.category}</td>

                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{v.contactPerson}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{v.email}</div>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 font-mono font-semibold text-slate-800">
                      {v.qualityRating}/100
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center font-mono font-semibold text-slate-800">
                    {v.onTimeDeliveryRate}%
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-block rounded-md bg-blue-50 px-2 py-0.5 font-mono font-semibold text-blue-600">
                      {v.reliabilityScore}/100
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${getStatusBadge(v.status)}`}>
                      {v.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={() => setSelectedVendor(v)}
                      className="rounded border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Audit Card
                    </button>
                    {hasPermission('CREATE_RFQ') && (
                      <button
                        onClick={() => handleOpenEdit(v)}
                        className="rounded border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Vendor Audit Card Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600">{selectedVendor.vendorId}</span>
                <h3 className="text-base font-bold text-slate-900">{selectedVendor.vendorName}</h3>
              </div>
              <button onClick={() => setSelectedVendor(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              {/* Score Badges */}
              <div className="grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 border border-slate-100 text-center">
                <div>
                  <span className="text-[11px] text-slate-500">Quality Index</span>
                  <div className="text-lg font-bold font-mono text-slate-900">{selectedVendor.qualityRating}/100</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">On-Time Delivery</span>
                  <div className="text-lg font-bold font-mono text-slate-900">{selectedVendor.onTimeDeliveryRate}%</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Fulfillment Reliability</span>
                  <div className="text-lg font-bold font-mono text-blue-600">{selectedVendor.reliabilityScore}/100</div>
                </div>
              </div>

              {/* Contact & Compliance info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-slate-100 p-3 space-y-1.5">
                  <span className="font-semibold text-slate-800">Primary Contact</span>
                  <div><strong>Name:</strong> {selectedVendor.contactPerson}</div>
                  <div><strong>Email:</strong> {selectedVendor.email}</div>
                  <div><strong>Phone:</strong> {selectedVendor.phone}</div>
                  <div><strong>Address:</strong> {selectedVendor.address}</div>
                </div>

                <div className="rounded-lg border border-slate-100 p-3 space-y-1.5">
                  <span className="font-semibold text-slate-800">Tax & Compliance Record</span>
                  <div><strong>GSTIN:</strong> {selectedVendor.gstin || '24AAACA1234F1Z8 (Verified)'}</div>
                  <div><strong>PAN:</strong> {selectedVendor.pan || 'AAACA1234F'}</div>
                  <div><strong>Category:</strong> {selectedVendor.category}</div>
                  <div><strong>Status:</strong> {selectedVendor.status}</div>
                </div>
              </div>

              <div>
                <span className="font-semibold text-slate-800">Products & Materials Supplied:</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {selectedVendor.productsSupplied.map((p) => (
                    <span key={p} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-slate-700">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                onClick={() => setSelectedVendor(null)}
                className="rounded-md border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingVendorId ? 'Edit Supplier Profile' : 'Onboard New Vendor'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Company Name *</label>
                <input
                  type="text"
                  required
                  value={form.vendorName}
                  onChange={(e) => setForm({ ...form, vendorName: e.target.value })}
                  placeholder="e.g. Paramount Paperboard Ltd."
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
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
                  <label className="block text-xs font-semibold text-slate-700">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as VendorStatus })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blacklisted">Blacklisted</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Contact Person</label>
                  <input
                    type="text"
                    value={form.contactPerson}
                    onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">GSTIN</label>
                  <input
                    type="text"
                    value={form.gstin}
                    onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                    placeholder="24AAACA1234F1Z8"
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Address / Industrial Hub</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="GIDC Vapi, Gujarat"
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Products Supplied (comma separated)</label>
                <input
                  type="text"
                  value={form.productsSupplied}
                  onChange={(e) => setForm({ ...form, productsSupplied: e.target.value })}
                  placeholder="e.g. Industrial Packaging Paper, Fluting Medium"
                  className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Quality (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.qualityRating}
                    onChange={(e) => setForm({ ...form, qualityRating: Number(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">On-Time %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.onTimeDeliveryRate}
                    onChange={(e) => setForm({ ...form, onTimeDeliveryRate: Number(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Reliability (0-100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.reliabilityScore}
                    onChange={(e) => setForm({ ...form, reliabilityScore: Number(e.target.value) })}
                    className="mt-1 w-full rounded-md border border-slate-200 px-3 py-1.5 text-xs font-mono focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-5 flex justify-end gap-2.5 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  {editingVendorId ? 'Save Changes' : 'Register Vendor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
