import React from 'react';
import { useProcure } from '../context/ProcureContext';
import { NavItemKey } from '../components/layout/Sidebar';
import {
  TrendingUp,
  Users,
  FileText,
  Clock,
  PiggyBank,
  Award,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  UploadCloud,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import { initialMonthlySpendData, initialSpendByCategory } from '../data/mockData';

interface DashboardViewProps {
  onNavigate: (key: NavItemKey) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    rfqs,
    purchaseRequests,
    vendors,
    quotations,
    contracts,
    transactions,
    auditLogs,
    settings,
  } = useProcure();

  const totalSpend = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const activeVendorsCount = vendors.filter(v => v.status === 'Active').length;
  const activeRfqsCount = rfqs.filter(r => ['Sent', 'Responses Received', 'Evaluation in Progress'].includes(r.status)).length;
  const pendingApprovalsCount = purchaseRequests.filter(p => p.status === 'Under Review' || p.status === 'Submitted').length;
  const totalSavings = initialMonthlySpendData.reduce((acc, m) => acc + m.savings, 0);

  const avgVendorScore = vendors.length > 0 
    ? (vendors.reduce((acc, v) => acc + v.qualityRating, 0) / vendors.length).toFixed(1)
    : '0';

  const vendorDistMap: Record<string, number> = {};
  vendors.forEach(v => {
    vendorDistMap[v.category] = (vendorDistMap[v.category] || 0) + 1;
  });
  const vendorDistData = Object.keys(vendorDistMap).map(k => ({ category: k, count: vendorDistMap[k] }));

  const topSupplierPerf = vendors
    .slice(0, 6)
    .map(v => ({
      name: v.vendorName.length > 18 ? v.vendorName.slice(0, 18) + '...' : v.vendorName,
      quality: v.qualityRating,
      reliability: v.reliabilityScore,
      onTime: v.onTimeDeliveryRate,
    }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Executive Procurement Overview
          </h1>
          <p className="text-xs text-slate-500">
            Real-time analytics and spend intelligence for {settings.organisation.organisationName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('quotation-analysis')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <UploadCloud className="h-3.5 w-3.5 text-blue-600" />
            Upload Quotation
          </button>
          <button
            onClick={() => onNavigate('recommendation')}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition-colors"
          >
            Run AI Scoring
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {/* KPI 1 */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600">Total Spend</span>
            <div className="rounded-md bg-blue-50 p-1 text-blue-600">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-slate-900 tabular-nums">
            ₹{(totalSpend / 100000).toFixed(1)}L
          </div>
          <div className="mt-1 flex items-center text-[11px] text-emerald-600 font-medium">
            <span>+8.4% vs last FY</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600">Active Vendors</span>
            <div className="rounded-md bg-slate-100 p-1 text-slate-700">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-slate-900 tabular-nums">
            {activeVendorsCount}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            <span>{vendors.length} Total Registered</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600">Active RFQs</span>
            <div className="rounded-md bg-indigo-50 p-1 text-indigo-600">
              <FileText className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-slate-900 tabular-nums">
            {activeRfqsCount}
          </div>
          <div className="mt-1 text-[11px] text-blue-600 font-medium">
            <span>{quotations.length} Quotes in Review</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600">Pending Approvals</span>
            <div className="rounded-md bg-amber-50 p-1 text-amber-600">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-slate-900 tabular-nums">
            {pendingApprovalsCount}
          </div>
          <div className="mt-1 text-[11px] text-amber-600 font-medium">
            <span>Requires sign-off</span>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600">Est. Cost Savings</span>
            <div className="rounded-md bg-emerald-50 p-1 text-emerald-600">
              <PiggyBank className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-emerald-600 tabular-nums">
            ₹{(totalSavings / 100000).toFixed(1)}L
          </div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">
            <span>~7.2% Multi-bid saving</span>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-medium text-slate-600">Avg Vendor Score</span>
            <div className="rounded-md bg-slate-100 p-1 text-slate-700">
              <Award className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold tracking-tight text-slate-900 tabular-nums">
            {avgVendorScore}
            <span className="text-xs text-slate-400 font-normal">/100</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">
            <span>Across 5 criteria</span>
          </div>
        </div>
      </div>

      {/* Row 1 Charts: Monthly Spend (Line Chart) & Spend by Category (Pie Chart) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Procurement Spend (2 cols) */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Monthly Procurement Spend vs. Budget</h2>
              <p className="text-xs text-slate-500">12-Month historical tracking in INR (₹)</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-900" />
                <span className="text-slate-600">Actual Spend</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-400" />
                <span className="text-slate-500">Budget Target</span>
              </div>
            </div>
          </div>

          <div className="mt-4 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={initialMonthlySpendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={{ stroke: '#E2E8F0' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickFormatter={(val) => `₹${val / 100000}L`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                  labelStyle={{ fontWeight: 600, color: '#0F172A' }}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                />
                <Line type="monotone" dataKey="spend" name="Actual Spend" stroke="#0F172A" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="budget" name="Budget" stroke="#94A3B8" strokeWidth={1.75} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spend by Category (Pie Chart) (1 col) */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Spend by Category</h2>
            <p className="text-xs text-slate-500">Manufacturing procurement allocations</p>
          </div>

          <div className="mt-2 h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={initialSpendByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {initialSpendByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Total']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
            {initialSpendByCategory.map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                  <span className="truncate text-slate-600">{c.name}</span>
                </div>
                <span className="font-semibold text-slate-900 tabular-nums">
                  ₹{(c.value / 100000).toFixed(1)}L
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Monthly Savings, Vendor Distribution, Supplier Quality */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Monthly Savings */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Cost Savings Generated</h2>
            <p className="text-xs text-slate-500">Savings via multi-vendor competitive bidding</p>
          </div>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={initialMonthlySpendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Saved']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="savings" stroke="#059669" fill="#059669" fillOpacity={0.12} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vendor Distribution */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Vendor Distribution by Category</h2>
            <p className="text-xs text-slate-500">Supply base concentration</p>
          </div>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendorDistData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 9, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#2563EB" radius={[4, 4, 0, 0]} name="Vendors" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Supplier Performance */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Supplier Quality Ratings</h2>
            <p className="text-xs text-slate-500">Audited ISO quality compliance index (0–100)</p>
          </div>
          <div className="mt-4 space-y-3">
            {topSupplierPerf.map((s) => (
              <div key={s.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate">{s.name}</span>
                  <span className="font-mono text-slate-700 font-semibold tabular-nums">{s.quality}/100</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full transition-all ${
                      s.quality >= 90 ? 'bg-emerald-600' : s.quality >= 80 ? 'bg-blue-600' : 'bg-amber-500'
                    }`}
                    style={{ width: `${s.quality}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Pending Actions & Audit Feed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Pending Actions */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Pending Actions</h2>
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800 border border-amber-200/60">
              Action Required
            </span>
          </div>

          <div className="mt-3 divide-y divide-slate-100">
            {/* Action 1 */}
            <div className="flex items-start justify-between py-3">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">RFQ-2026-001 Ready for Decision</div>
                  <div className="text-[11px] text-slate-500">3 verified quotations received for Industrial Packaging Paper</div>
                </div>
              </div>
              <button
                onClick={() => onNavigate('vendor-comparison')}
                className="flex items-center gap-1 rounded-md border border-slate-200/80 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Compare
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Action 2 */}
            <div className="flex items-start justify-between py-3">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">PR-2026-004 Under Review</div>
                  <div className="text-[11px] text-slate-500">Heat-Treated Wooden Pallets (₹9.6L) awaits manager sign-off</div>
                </div>
              </div>
              <button
                onClick={() => onNavigate('purchase-requests')}
                className="flex items-center gap-1 rounded-md border border-slate-200/80 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Review
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Action 3 */}
            <div className="flex items-start justify-between py-3">
              <div className="flex items-start gap-3">
                <div className="rounded-lg bg-rose-50 p-2 text-rose-600">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-900">Contract Expiration Alert (&lt; 60 Days)</div>
                  <div className="text-[11px] text-slate-500">Shanti Starches CAS-2025-SSA-02 expires 2025-12-31</div>
                </div>
              </div>
              <button
                onClick={() => onNavigate('contracts')}
                className="flex items-center gap-1 rounded-md border border-slate-200/80 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Inspect
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Activity Feed */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Recent Procurement Activities</h2>
            <button
              onClick={() => onNavigate('settings')}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Audit Trail
            </button>
          </div>

          <div className="mt-3 space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.logId} className="flex items-start gap-3">
                <div className="mt-0.5 rounded-full bg-slate-100 p-1 text-slate-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-slate-900">{log.action.replace(/_/g, ' ')}</div>
                  <div className="text-slate-600">{log.details}</div>
                  <div className="mt-0.5 text-[11px] text-slate-400">
                    {log.userName} · {new Date(log.timestamp).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
