import React, { useState } from 'react';
import { useProcure } from '../context/ProcureContext';
import { api } from '../services/api';
import {
  PieChart as PieIcon,
  TrendingUp,
  BarChart2,
  Sparkles,
  AlertCircle,
  PiggyBank,
  ArrowUpRight,
  Filter,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { initialMonthlySpendData, initialSpendByCategory } from '../data/mockData';

export const SpendAnalyticsView: React.FC = () => {
  const { transactions, vendors, settings, showToast } = useProcure();

  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    highestBudgetCategory?: string;
    vendorConcentrationInsight?: string;
    costSavingOpportunities?: string[];
    priceVariationAlerts?: string[];
    duplicateOrAnomalyFlags?: string[];
  } | null>(null);

  // Compute vendor spend aggregation
  const vendorSpendMap: Record<string, { name: string; amount: number; count: number }> = {};
  transactions.forEach((t) => {
    if (!vendorSpendMap[t.vendorId]) {
      vendorSpendMap[t.vendorId] = {
        name: t.vendorName,
        amount: 0,
        count: 0,
      };
    }
    vendorSpendMap[t.vendorId].amount += t.amount;
    vendorSpendMap[t.vendorId].count += 1;
  });

  const topVendorsSpend = Object.values(vendorSpendMap)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6)
    .map(v => ({
      name: v.name.length > 18 ? v.name.slice(0, 18) + '...' : v.name,
      spend: v.amount,
      count: v.count,
    }));

  const totalExpenditure = transactions.reduce((acc, t) => acc + t.amount, 0);
  const avgPurchaseValue = transactions.length ? Math.round(totalExpenditure / transactions.length) : 0;

  // Material price variation
  const priceVariationList = [
    { material: 'Industrial Packaging Paper 180 GSM', minRate: 116, maxRate: 123, variance: '+6.0%' },
    { material: 'Virgin Bleached Hardwood Pulp', minRate: 64000, maxRate: 64000, variance: '0.0%' },
    { material: 'Cationic Corn Starch Binder', minRate: 34000, maxRate: 34000, variance: '0.0%' },
    { material: 'Heat-Treated Wooden Pallets', minRate: 800, maxRate: 800, variance: '0.0%' },
  ];

  const handleRunSpendAi = async () => {
    try {
      setIsGeneratingAi(true);
      const res = await api.getSpendInsightsWithGemini({
        totalSpend: `₹${(totalExpenditure / 100000).toFixed(1)} Lakhs`,
        topCategories: initialSpendByCategory,
        topVendors: topVendorsSpend,
        transactionSummary: transactions.slice(0, 10),
      });
      setAiInsights(res);
      showToast('AI Spend insights synthesized!', 'success');
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Procurement Spend Intelligence & Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Multi-tier expenditure aggregation, supplier concentration indexing & cost reduction opportunities
          </p>
        </div>

        <button
          onClick={handleRunSpendAi}
          disabled={isGeneratingAi}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-medium text-white shadow-xs hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          {isGeneratingAi ? 'Synthesizing...' : 'Generate AI Spend Insights'}
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Recorded Spend</span>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900 tabular-nums">
            ₹{(totalExpenditure / 100000).toFixed(2)}L
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">15 Verified Invoices</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Average PO Value</span>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900 tabular-nums">
            ₹{(avgPurchaseValue / 1000).toFixed(1)}k
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-medium">Per Transaction Order</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Top Spend Category</span>
          <div className="mt-2 text-base font-bold text-slate-900 truncate">
            Paper & Board
          </div>
          <div className="mt-1 text-[11px] text-blue-600 font-medium">43.2% of Total Spend</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Vendor Concentration</span>
          <div className="mt-2 text-base font-bold text-slate-900">
            Top 2 = 48.5%
          </div>
          <div className="mt-1 text-[11px] text-amber-600 font-medium">Beta & Alpha Suppliers</div>
        </div>
      </div>

      {/* AI Spend Insights Showcase (if generated or default) */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">Gemini Strategic Spend Intelligence</h2>
          </div>
          <span className="text-xs font-medium text-slate-500">Model: Gemini 3.8 Flash</span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 text-xs">
          <div className="rounded-lg bg-blue-50/40 p-4 border border-blue-100 space-y-1.5">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <PieIcon className="h-4 w-4 text-blue-600" />
              Highest Budget Category & Concentration
            </h3>
            <p className="text-slate-700 leading-relaxed">
              {aiInsights?.highestBudgetCategory ||
                'Paper & Board dominates annual expenditure at ₹89.4 Lakhs (43.2%), followed by Raw Pulp & Fiber at ₹65.6 Lakhs (31.7%).'}
            </p>
            <p className="text-slate-600 leading-relaxed pt-1">
              {aiInsights?.vendorConcentrationInsight ||
                'Beta Industrial Materials holds the highest single-supplier share (29.4%). Volume rebates are currently captured, but secondary supplier qualification is recommended.'}
            </p>
          </div>

          <div className="rounded-lg bg-emerald-50/40 p-4 border border-emerald-100 space-y-1.5">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
              <PiggyBank className="h-4 w-4 text-emerald-600" />
              Identified Cost-Saving Opportunities
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-700 leading-relaxed">
              {(aiInsights?.costSavingOpportunities || [
                'Consolidate Kraft Reel volumes with Beta Industrial Materials for an additional 1.5% tier rebate, saving ~₹1.8 Lakhs annually.',
                'Transition Cationic Starch spot orders with Shanti Starches into an annual rate contract to hedge against raw grain price surges.',
                'Open pallet supply to competitive bidding across Modern Pallet Solutions and regional suppliers to capture 8% logistics savings.',
              ]).map((op, idx) => (
                <li key={idx}>{op}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Row: Vendor-Wise Spend & Quarterly Spend Trends */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Vendor Spend Bar Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Expenditure by Supplier</h2>
            <p className="text-xs text-slate-500">Top vendors by total invoice value</p>
          </div>
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topVendorsSpend} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" tickFormatter={(v) => `₹${v / 100000}L`} tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Spend']}
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="spend" fill="#0F172A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Price Variation Table */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900">Material Price Variance Analysis</h2>
            <p className="text-xs text-slate-500">Benchmark variation across supplier bids</p>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 font-semibold text-slate-700">
                <tr>
                  <th className="px-3 py-2.5">Material</th>
                  <th className="px-3 py-2.5 text-right">Min Rate</th>
                  <th className="px-3 py-2.5 text-right">Max Rate</th>
                  <th className="px-3 py-2.5 text-right">Price Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {priceVariationList.map((item) => (
                  <tr key={item.material} className="hover:bg-slate-50/60">
                    <td className="px-3 py-3 font-medium text-slate-900">{item.material}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums">₹{item.minRate}</td>
                    <td className="px-3 py-3 text-right font-mono tabular-nums">₹{item.maxRate}</td>
                    <td className="px-3 py-3 text-right font-mono font-semibold text-blue-600">{item.variance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
