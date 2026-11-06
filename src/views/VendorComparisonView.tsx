import React, { useState } from 'react';
import { useProcure } from '../context/ProcureContext';
import { calculateLandedCost } from '../utils/procurementCalculations';
import { NavItemKey } from '../components/layout/Sidebar';
import {
  GitCompare,
  ArrowRight,
  Download,
  CheckCircle2,
  Info,
  Sparkles,
  Printer,
} from 'lucide-react';

interface VendorComparisonViewProps {
  onNavigate: (key: NavItemKey) => void;
}

export const VendorComparisonView: React.FC<VendorComparisonViewProps> = ({ onNavigate }) => {
  const {
    rfqs,
    selectedRfqId,
    setSelectedRfqId,
    selectedRfq,
    quotations,
    vendors,
    settings,
    updateSettings,
    showToast,
  } = useProcure();

  const [sortBy, setSortBy] = useState<'landedCost' | 'delivery' | 'quality'>('landedCost');
  const isGstRecoverable = settings.taxConfig.isGstRecoverable;

  const currentQuotes = quotations.filter((q) => q.rfqId === selectedRfqId);

  const comparisonItems = currentQuotes.map((q) => {
    const v = vendors.find((item) => item.vendorId === q.vendorId);
    const landed = calculateLandedCost(q, isGstRecoverable);
    return {
      quotation: q,
      vendor: v,
      landed,
      deliveryDays: q.extractedData.estimatedDeliveryDays || 15,
      creditDays: q.extractedData.creditPeriodDays || 0,
      quality: v?.qualityRating || 70,
      reliability: v?.reliabilityScore || 70,
    };
  });

  comparisonItems.sort((a, b) => {
    if (sortBy === 'landedCost') return a.landed.totalLandedCost - b.landed.totalLandedCost;
    if (sortBy === 'delivery') return a.deliveryDays - b.deliveryDays;
    if (sortBy === 'quality') return b.quality - a.quality;
    return 0;
  });

  const bestUnitPrice = comparisonItems.length ? Math.min(...comparisonItems.map(i => i.landed.unitPrice)) : 0;
  const bestDiscount = comparisonItems.length ? Math.max(...comparisonItems.map(i => i.landed.discountAmount)) : 0;
  const bestFreight = comparisonItems.length ? Math.min(...comparisonItems.map(i => i.landed.freightCharges)) : 0;
  const bestLandedCost = comparisonItems.length ? Math.min(...comparisonItems.map(i => i.landed.totalLandedCost)) : 0;
  const bestDelivery = comparisonItems.length ? Math.min(...comparisonItems.map(i => i.deliveryDays)) : 0;
  const bestCreditDays = comparisonItems.length ? Math.max(...comparisonItems.map(i => i.creditDays)) : 0;
  const bestQuality = comparisonItems.length ? Math.max(...comparisonItems.map(i => i.quality)) : 0;
  const bestReliability = comparisonItems.length ? Math.max(...comparisonItems.map(i => i.reliability)) : 0;

  const handleExportCsv = () => {
    if (comparisonItems.length === 0) {
      showToast('No quotation data to export', 'warning');
      return;
    }

    const headers = [
      'Parameter',
      ...comparisonItems.map(i => i.vendor?.vendorName || i.quotation.extractedData.vendorName),
    ];

    const rows = [
      ['Unit Price (₹)', ...comparisonItems.map(i => i.landed.unitPrice)],
      ['Gross Basic Amount (₹)', ...comparisonItems.map(i => i.landed.basicAmount)],
      ['Discount (₹)', ...comparisonItems.map(i => i.landed.discountAmount)],
      ['Net Basic Amount (₹)', ...comparisonItems.map(i => i.landed.netBasicAmount)],
      ['Freight Charges (₹)', ...comparisonItems.map(i => i.landed.freightCharges)],
      ['Recoverable GST (18%) (₹)', ...comparisonItems.map(i => i.landed.gstAmount)],
      ['Total Landed Cost (₹)', ...comparisonItems.map(i => i.landed.totalLandedCost)],
      ['Landed Cost Per Unit (₹)', ...comparisonItems.map(i => i.landed.landedCostPerUnit)],
      ['Delivery Timeline (Days)', ...comparisonItems.map(i => `${i.deliveryDays} Days`)],
      ['Payment Terms', ...comparisonItems.map(i => `${i.creditDays} Days Credit`)],
      ['Quality Score', ...comparisonItems.map(i => `${i.quality}/100`)],
      ['Reliability Score', ...comparisonItems.map(i => `${i.reliability}/100`)],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Vendor_Comparison_${selectedRfq?.rfqNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Comparison matrix exported to CSV', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Automatic Vendor Comparison Workspace
          </h1>
          <p className="text-xs text-slate-500">
            Multi-vendor side-by-side landed cost analysis, commercial trade-offs & lead time evaluation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            Print
          </button>

          <button
            onClick={() => onNavigate('recommendation')}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            Run AI Recommendation Engine
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* RFQ Context Strip & Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <GitCompare className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600">{selectedRfq?.rfqNumber}</span>
              <span className="text-xs font-bold text-slate-900">{selectedRfq?.title}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Quantity: {selectedRfq?.quantity.toLocaleString('en-IN')} {selectedRfq?.unit} · Required Delivery: {selectedRfq?.deliveryLeadTimeDays} Days
            </div>
          </div>
        </div>

        {/* Sort & Tax Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">RFQ:</span>
            <select
              value={selectedRfqId}
              onChange={(e) => setSelectedRfqId(e.target.value)}
              className="rounded-md border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              {rfqs.map(r => (
                <option key={r.rfqId} value={r.rfqId}>{r.rfqNumber}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-md border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="landedCost">Lowest Landed Cost</option>
              <option value="delivery">Fastest Lead Time</option>
              <option value="quality">Highest Quality Rating</option>
            </select>
          </div>

          {/* Tax Recoverability Toggle */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200/80 bg-slate-50/80 px-2.5 py-1">
            <span className="text-xs font-medium text-slate-700">GST Recoverable (ITC):</span>
            <input
              type="checkbox"
              checked={isGstRecoverable}
              onChange={(e) => updateSettings({
                taxConfig: {
                  ...settings.taxConfig,
                  isGstRecoverable: e.target.checked,
                }
              })}
              className="h-3.5 w-3.5 rounded text-blue-600 focus:ring-0"
            />
          </div>
        </div>
      </div>

      {/* Tax Assumption Disclaimer */}
      <div className="rounded-lg bg-blue-50/50 p-3 text-xs border border-blue-100 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="text-slate-700 leading-relaxed text-[11px]">
          <strong>Tax Treatment Policy:</strong> {isGstRecoverable
            ? 'GST paid on paper materials is claimed as Input Tax Credit (ITC) under CGST Act and is excluded from Net Landed Cost.'
            : 'GST is treated as a direct procurement cost and is added into the Total Landed Cost calculation.'}
        </div>
      </div>

      {/* Comparison Matrix Table */}
      {comparisonItems.length === 0 ? (
        <div className="rounded-xl border border-slate-200/80 bg-white p-12 text-center shadow-2xs">
          <GitCompare className="mx-auto h-8 w-8 text-slate-300" />
          <h3 className="mt-2 text-sm font-bold text-slate-900">No Quotations for this RFQ Yet</h3>
          <p className="mt-1 text-xs text-slate-500">
            Upload supplier quotation documents in the Quotation Analysis centre to generate side-by-side comparison.
          </p>
          <button
            onClick={() => onNavigate('quotation-analysis')}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            Upload Quotation
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 font-semibold text-slate-700">
                  <th className="px-4 py-3.5 w-64 bg-slate-100/60 sticky left-0 z-10 text-[11px] uppercase tracking-wider text-slate-500">
                    Evaluation Parameter
                  </th>
                  {comparisonItems.map((item) => (
                    <th key={item.quotation.quotationId} className="px-4 py-3.5 min-w-[200px]">
                      <div className="font-bold text-slate-900 text-sm">
                        {item.vendor?.vendorName || item.quotation.extractedData.vendorName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-500 font-normal">
                        Quote #{item.quotation.quotationNumber}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-slate-700">
                {/* 1. Unit Price */}
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 bg-slate-50/40 sticky left-0 z-10">
                    Unit Price
                  </td>
                  {comparisonItems.map((item) => {
                    const isBest = item.landed.unitPrice === bestUnitPrice;
                    return (
                      <td key={item.quotation.quotationId} className="px-4 py-3 font-mono">
                        <span className="font-bold text-slate-900 text-xs">
                          ₹{item.landed.unitPrice.toLocaleString('en-IN')}
                        </span>
                        {isBest && (
                          <span className="ml-2 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            Lowest Rate
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 2. Gross Basic Amount */}
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700 bg-slate-50/40 sticky left-0 z-10">
                    Gross Basic Amount ({selectedRfq?.quantity.toLocaleString('en-IN')} units)
                  </td>
                  {comparisonItems.map((item) => (
                    <td key={item.quotation.quotationId} className="px-4 py-3 font-mono text-slate-800 tabular-nums">
                      ₹{item.landed.basicAmount.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>

                {/* 3. Discount */}
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700 bg-slate-50/40 sticky left-0 z-10">
                    Discount Offered
                  </td>
                  {comparisonItems.map((item) => {
                    const isBest = item.landed.discountAmount === bestDiscount && bestDiscount > 0;
                    return (
                      <td key={item.quotation.quotationId} className="px-4 py-3 font-mono text-emerald-600 tabular-nums">
                        -{item.quotation.extractedData.discountPercent}% (₹{item.landed.discountAmount.toLocaleString('en-IN')})
                        {isBest && (
                          <span className="ml-1.5 inline-block rounded bg-emerald-50 px-1 text-[10px] font-semibold text-emerald-700">
                            Max Rebate
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 4. Net Basic Amount */}
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 bg-slate-50/40 sticky left-0 z-10">
                    Net Basic Amount
                  </td>
                  {comparisonItems.map((item) => (
                    <td key={item.quotation.quotationId} className="px-4 py-3 font-mono font-semibold text-slate-900 tabular-nums">
                      ₹{item.landed.netBasicAmount.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>

                {/* 5. Freight Charges */}
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700 bg-slate-50/40 sticky left-0 z-10">
                    Freight & Transit Charges
                  </td>
                  {comparisonItems.map((item) => {
                    const isBest = item.landed.freightCharges === bestFreight;
                    return (
                      <td key={item.quotation.quotationId} className="px-4 py-3 font-mono text-slate-800 tabular-nums">
                        ₹{item.landed.freightCharges.toLocaleString('en-IN')}
                        {isBest && (
                          <span className="ml-1.5 inline-block rounded bg-emerald-50 px-1 text-[10px] font-semibold text-emerald-700">
                            Lowest Freight
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 6. GST Amount */}
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-700 bg-slate-50/40 sticky left-0 z-10">
                    GST (18%) {isGstRecoverable ? '(ITC Claimed - Excluded)' : '(Added to Cost)'}
                  </td>
                  {comparisonItems.map((item) => (
                    <td key={item.quotation.quotationId} className="px-4 py-3 font-mono text-slate-500 tabular-nums">
                      ₹{item.landed.gstAmount.toLocaleString('en-IN')}
                    </td>
                  ))}
                </tr>

                {/* 7. TOTAL LANDED COST (Highlight Row) */}
                <tr className="bg-slate-50/90 font-bold border-y-2 border-slate-200">
                  <td className="px-4 py-3.5 text-slate-900 bg-slate-100/70 sticky left-0 z-10">
                    Total Landed Cost
                  </td>
                  {comparisonItems.map((item) => {
                    const isLowest = item.landed.totalLandedCost === bestLandedCost;
                    return (
                      <td key={item.quotation.quotationId} className="px-4 py-3.5 font-mono">
                        <div className="text-sm font-extrabold text-slate-900 tabular-nums">
                          ₹{item.landed.totalLandedCost.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] font-medium text-slate-500">
                          ₹{item.landed.landedCostPerUnit} / unit
                        </div>
                        {isLowest && (
                          <div className="mt-1 inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                            <CheckCircle2 className="h-3 w-3" />
                            Lowest Landed Cost
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 8. Delivery Timeline */}
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 bg-slate-50/40 sticky left-0 z-10">
                    Promised Delivery Timeline
                  </td>
                  {comparisonItems.map((item) => {
                    const isBest = item.deliveryDays === bestDelivery;
                    const isLate = item.deliveryDays > (selectedRfq?.deliveryLeadTimeDays || 15);
                    return (
                      <td key={item.quotation.quotationId} className="px-4 py-3 font-mono">
                        <span className={`font-bold ${isLate ? 'text-rose-600' : 'text-slate-900'}`}>
                          {item.deliveryDays} Days
                        </span>
                        {isLate ? (
                          <span className="ml-2 inline-block rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                            +{item.deliveryDays - (selectedRfq?.deliveryLeadTimeDays || 15)}d Late
                          </span>
                        ) : isBest ? (
                          <span className="ml-2 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            Fastest
                          </span>
                        ) : null}
                      </td>
                    );
                  })}
                </tr>

                {/* 9. Payment Terms */}
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 bg-slate-50/40 sticky left-0 z-10">
                    Payment Terms
                  </td>
                  {comparisonItems.map((item) => {
                    const isBest = item.creditDays === bestCreditDays;
                    return (
                      <td key={item.quotation.quotationId} className="px-4 py-3">
                        <div className="font-mono font-bold text-slate-900">{item.creditDays} Days Credit</div>
                        <div className="text-[10px] text-slate-500 truncate">{item.quotation.extractedData.paymentTerms}</div>
                        {isBest && (
                          <span className="mt-0.5 inline-block rounded bg-emerald-50 px-1 text-[10px] font-semibold text-emerald-700">
                            Best Credit Terms
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 10. Quality Score */}
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 bg-slate-50/40 sticky left-0 z-10">
                    Product Quality Rating
                  </td>
                  {comparisonItems.map((item) => {
                    const isBest = item.quality === bestQuality;
                    return (
                      <td key={item.quotation.quotationId} className="px-4 py-3 font-mono">
                        <span className="font-bold text-slate-900">{item.quality}/100</span>
                        {isBest && (
                          <span className="ml-2 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            Highest QA
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* 11. Supplier Reliability */}
                <tr className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-semibold text-slate-900 bg-slate-50/40 sticky left-0 z-10">
                    Supplier Historical Reliability
                  </td>
                  {comparisonItems.map((item) => {
                    const isBest = item.reliability === bestReliability;
                    return (
                      <td key={item.quotation.quotationId} className="px-4 py-3 font-mono">
                        <span className="font-bold text-slate-900">{item.reliability}/100</span>
                        {isBest && (
                          <span className="ml-2 inline-block rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                            Top Track Record
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
