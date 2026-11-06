import React, { useState } from 'react';
import { useProcure } from '../context/ProcureContext';
import {
  FileBarChart,
  Download,
  Printer,
  CheckCircle2,
  Calendar,
  Building,
  Award,
  ShieldCheck,
  FileText,
} from 'lucide-react';

export const ProcurementReportsView: React.FC = () => {
  const {
    organisation,
    selectedRfq,
    getEvaluationsForRfq,
    selectedRfqId,
    rfqRecommendation,
    vendors,
    settings,
    currentUser,
    showToast,
  } = useProcure();

  const [reportType, setReportType] = useState<
    | 'vendor-comparison'
    | 'rfq-evaluation'
    | 'ai-recommendation'
    | 'spend'
    | 'supplier-performance'
    | 'contract-risk'
  >('ai-recommendation');

  const evaluations = getEvaluationsForRfq(selectedRfqId);
  const topVendor = evaluations[0] || null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCsv = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Report,RFQ Number,Recommended Supplier,Total Score,Landed Cost,Date\n' +
      `AI Procurement Recommendation,${selectedRfq?.rfqNumber},"${rfqRecommendation?.recommendedVendorName || topVendor?.vendorName}",${rfqRecommendation?.recommendedScore || topVendor?.weightedScore},₹${topVendor?.totalLandedCost},${new Date().toISOString().split('T')[0]}`;
    const encoded = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encoded);
    link.setAttribute('download', `ProcureAI_Report_${selectedRfq?.rfqNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Report CSV exported', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Executive Procurement Reports
          </h1>
          <p className="text-xs text-slate-500">
            Audit-ready formal evaluation briefs, vendor scorecards & compliance dossiers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            Export CSV
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-medium text-white shadow-xs hover:bg-slate-800 transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            Print / Save as PDF
          </button>
        </div>
      </div>

      {/* Report Selector Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto p-1.5 bg-slate-100 rounded-xl">
        {[
          { key: 'ai-recommendation', label: 'AI Recommendation Report' },
          { key: 'vendor-comparison', label: 'Vendor Comparison Report' },
          { key: 'rfq-evaluation', label: 'RFQ Evaluation Report' },
          { key: 'supplier-performance', label: 'Supplier Performance Report' },
          { key: 'spend', label: 'Procurement Spend Report' },
          { key: 'contract-risk', label: 'Contract Risk Report' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setReportType(tab.key as any)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors ${
              reportType === tab.key
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Formal Business Report Layout (Print Ready) */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Report Header */}
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5">
          <div>
            <div className="text-xl font-extrabold tracking-tight text-slate-900">
              {organisation.organisationName}
            </div>
            <div className="text-xs text-slate-600">
              {organisation.industry} · Procurement & Supply Chain Division
            </div>
            <div className="mt-2 text-xs font-mono text-slate-500">
              Report Ref: DOC-REC-{selectedRfq?.rfqNumber}-{Date.now().toString().slice(-4)}
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block rounded-md bg-slate-900 px-2.5 py-1 text-xs font-bold text-white uppercase tracking-wider">
              {reportType.replace(/-/g, ' ')}
            </span>
            <div className="mt-2 text-xs text-slate-500">
              Generated: <strong>{new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</strong>
            </div>
            <div className="text-xs text-slate-500">
              Generated by: <strong>{currentUser.name} ({currentUser.role})</strong>
            </div>
          </div>
        </div>

        {/* Section 1: RFQ & Sourcing Scope */}
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
            01. Procurement Sourcing Scope
          </h2>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4 text-xs">
            <div>
              <span className="text-slate-500">RFQ Tender Number:</span>
              <div className="font-mono font-bold text-slate-900">{selectedRfq?.rfqNumber}</div>
            </div>
            <div>
              <span className="text-slate-500">Material Specification:</span>
              <div className="font-bold text-slate-900">{selectedRfq?.title}</div>
            </div>
            <div>
              <span className="text-slate-500">Requisition Volume:</span>
              <div className="font-mono font-bold text-slate-900">
                {selectedRfq?.quantity.toLocaleString('en-IN')} {selectedRfq?.unit}
              </div>
            </div>
            <div>
              <span className="text-slate-500">Required Lead Time:</span>
              <div className="font-mono font-bold text-slate-900">{selectedRfq?.deliveryLeadTimeDays} Days</div>
            </div>
          </div>
        </div>

        {/* Section 2: Evaluation Methodology & Weighted Scores */}
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
            02. Deterministic Weighted Evaluation
          </h2>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Multi-factor deterministic evaluation applied based on configured company weights: Landed Cost ({settings.scoringWeights.costWeight}%), Product Quality ({settings.scoringWeights.qualityWeight}%), Delivery ({settings.scoringWeights.deliveryWeight}%), Payment Terms ({settings.scoringWeights.paymentWeight}%), Supplier Reliability ({settings.scoringWeights.reliabilityWeight}%).
          </p>

          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 font-semibold text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-center">Rank</th>
                  <th className="px-3 py-2">Supplier</th>
                  <th className="px-3 py-2 text-right">Landed Cost</th>
                  <th className="px-3 py-2 text-center">Lead Time</th>
                  <th className="px-3 py-2 text-center">Quality</th>
                  <th className="px-3 py-2 text-center">Credit Days</th>
                  <th className="px-3 py-2 text-center font-bold">Overall Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {evaluations.map((ev) => (
                  <tr key={ev.evaluationId} className={ev.ranking === 1 ? 'bg-blue-50/40 font-semibold' : ''}>
                    <td className="px-3 py-2 text-center font-mono">#{ev.ranking}</td>
                    <td className="px-3 py-2 text-slate-900">{ev.vendorName}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums">
                      ₹{ev.totalLandedCost.toLocaleString('en-IN')}
                    </td>
                    <td className="px-3 py-2 text-center font-mono">{ev.deliveryDays} d</td>
                    <td className="px-3 py-2 text-center font-mono">{ev.qualityScore}/100</td>
                    <td className="px-3 py-2 text-center font-mono">{ev.creditDays} d</td>
                    <td className="px-3 py-2 text-center font-mono font-bold text-slate-900">
                      {ev.weightedScore}/100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: AI Recommendation Brief */}
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-1">
            03. Procurement Committee Recommendation Brief
          </h2>

          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4 space-y-3 text-xs leading-relaxed text-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Recommended Awardee:</span>
                <div className="text-base font-bold text-slate-900">
                  {rfqRecommendation?.recommendedVendorName || topVendor?.vendorName}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-semibold text-slate-500 uppercase">Score:</span>
                <div className="text-lg font-bold font-mono text-blue-600">
                  {rfqRecommendation?.recommendedScore || topVendor?.weightedScore}/100
                </div>
              </div>
            </div>

            <div>
              <strong>Selection Rationale:</strong>
              <p className="mt-0.5 text-slate-700">
                {rfqRecommendation?.whySelected ||
                  `${topVendor?.vendorName} provides the highest overall landed value, combining robust ISO-tested quality rating with guaranteed on-time delivery schedule.`}
              </p>
            </div>

            <div>
              <strong>Commercial & Cashflow Impact:</strong>
              <p className="mt-0.5 text-slate-700">
                {rfqRecommendation?.commercialEvaluation ||
                  `Total landed commitment: ₹${topVendor?.totalLandedCost.toLocaleString('en-IN')}. GST is fully recoverable under ITC.`}
              </p>
            </div>

            <div>
              <strong>Advisory Risk Considerations:</strong>
              <p className="mt-0.5 text-slate-700">
                {rfqRecommendation?.potentialRisks.join(' ') ||
                  'Ensure transit insurance carrier verification prior to dispatch from mill.'}
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Formal Sign-off Blocks */}
        <div className="border-t-2 border-slate-900 pt-6">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 pb-4">
            04. Executive Approvals & Delegated Authority Sign-off
          </h2>

          <div className="grid grid-cols-3 gap-6 text-xs">
            <div className="rounded-lg border border-slate-200 p-3">
              <span className="text-[10px] uppercase text-slate-400 font-bold">Evaluated By:</span>
              <div className="mt-2 font-bold text-slate-900">Vikram Mehta</div>
              <div className="text-[11px] text-slate-500">Procurement Executive</div>
              <div className="mt-4 border-t border-dashed border-slate-300 pt-1 text-[10px] text-slate-400">
                Signature / Digital Stamp
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-3">
              <span className="text-[10px] uppercase text-slate-400 font-bold">Reviewed By:</span>
              <div className="mt-2 font-bold text-slate-900">Sunita Nair</div>
              <div className="text-[11px] text-slate-500">Finance Reviewer</div>
              <div className="mt-4 border-t border-dashed border-slate-300 pt-1 text-[10px] text-slate-400">
                Signature / Digital Stamp
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-3 bg-slate-50">
              <span className="text-[10px] uppercase text-slate-400 font-bold">Authorized Signatory:</span>
              <div className="mt-2 font-bold text-slate-900">
                {rfqRecommendation?.approvedBy || 'Ananya Deshmukh'}
              </div>
              <div className="text-[11px] text-slate-500">Procurement Manager</div>
              <div className="mt-4 border-t border-dashed border-slate-300 pt-1 text-[10px] font-bold text-emerald-700">
                {rfqRecommendation?.approvalStatus === 'Approved' ? 'APPROVED & SEALED' : 'PENDING FINAL SIGN-OFF'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
