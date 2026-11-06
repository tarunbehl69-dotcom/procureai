import React, { useState, useEffect } from 'react';
import { useProcure } from '../context/ProcureContext';
import { api } from '../services/api';
import { NavItemKey } from '../components/layout/Sidebar';
import {
  Sparkles,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Sliders,
  ArrowRight,
  TrendingUp,
  Download,
} from 'lucide-react';

interface AiRecommendationViewProps {
  onNavigate: (key: NavItemKey) => void;
}

export const AiRecommendationView: React.FC<AiRecommendationViewProps> = ({ onNavigate }) => {
  const {
    selectedRfq,
    selectedRfqId,
    getEvaluationsForRfq,
    settings,
    updateSettings,
    rfqRecommendation,
    setRfqRecommendation,
    hasPermission,
    showToast,
  } = useProcure();

  const [isGenerating, setIsGenerating] = useState(false);
  const [weights, setWeights] = useState(settings.scoringWeights);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  useEffect(() => {
    setWeights(settings.scoringWeights);
  }, [settings.scoringWeights]);

  const evaluations = getEvaluationsForRfq(selectedRfqId);
  const topVendor = evaluations[0] || null;
  const secondVendor = evaluations[1] || null;

  const totalWeight = weights.costWeight + weights.qualityWeight + weights.deliveryWeight + weights.paymentWeight + weights.reliabilityWeight;

  const handleGenerateRecommendation = async () => {
    if (evaluations.length === 0) {
      showToast('No evaluated vendor quotations available for this RFQ', 'warning');
      return;
    }

    try {
      setIsGenerating(true);
      const rec = await api.generateAiRecommendation({
        rfq: selectedRfq!,
        evaluations,
        weights,
        isGstRecoverable: settings.taxConfig.isGstRecoverable,
      });

      setRfqRecommendation(rec);
      showToast('AI Procurement recommendation generated successfully!', 'success');
    } catch (err: any) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveWeights = async () => {
    if (totalWeight !== 100) {
      showToast(`Weights must total exactly 100% (currently ${totalWeight}%)`, 'warning');
      return;
    }
    await updateSettings({ scoringWeights: weights });
    showToast('Updated scoring weights applied to evaluation matrix', 'success');
  };

  const handleApproveAward = () => {
    if (!rfqRecommendation) return;
    setRfqRecommendation({
      ...rfqRecommendation,
      approvalStatus: 'Approved',
      approvedBy: 'Ananya Deshmukh (Procurement Manager)',
      approvedAt: new Date().toISOString(),
    });
    setIsApprovalModalOpen(false);
    showToast(`Award approved for ${rfqRecommendation.recommendedVendorName}! Decision audit recorded.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            AI Recommendation & Multi-Factor Scoring Engine
          </h1>
          <p className="text-xs text-slate-500">
            Deterministic mathematical evaluation paired with Gemini transparent procurement explainability
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerateRecommendation}
            disabled={isGenerating || evaluations.length === 0}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-slate-800 disabled:opacity-50 transition-colors"
          >
            <Sparkles className="h-4 w-4 text-blue-400" />
            {isGenerating ? 'Analyzing with Gemini...' : 'Generate AI Recommendation'}
          </button>

          {rfqRecommendation && (
            <button
              onClick={() => onNavigate('reports')}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
            >
              <Download className="h-3.5 w-3.5 text-slate-500" />
              Download Report
            </button>
          )}
        </div>
      </div>

      {/* Target RFQ Banner */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600">{selectedRfq?.rfqNumber}</span>
              <span className="text-xs font-bold text-slate-900">{selectedRfq?.title}</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Target Lead Time: {selectedRfq?.deliveryLeadTimeDays} Days · Quantity: {selectedRfq?.quantity.toLocaleString('en-IN')} {selectedRfq?.unit}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">GST Treatment:</span>
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
            {settings.taxConfig.isGstRecoverable ? 'ITC Recoverable (Excluded from Landed Cost)' : 'Added to Cost'}
          </span>
        </div>
      </div>

      {/* Interactive Scoring Weights Customizer */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="h-4 w-4 text-blue-600" />
              Evaluation Criteria & Weighting Configuration
            </h2>
            <p className="text-xs text-slate-500">
              Adjust weights to simulate sensitivity (Total must equal 100%)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold font-mono ${totalWeight === 100 ? 'text-emerald-600' : 'text-rose-600'}`}>
              Total: {totalWeight}%
            </span>
            <button
              onClick={handleSaveWeights}
              disabled={totalWeight !== 100}
              className="rounded-md bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40 transition-colors"
            >
              Apply Weights
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
          {/* Weight 1: Landed Cost */}
          <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Landed Cost</span>
              <span className="font-mono text-blue-600 font-bold">{weights.costWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              value={weights.costWeight}
              onChange={(e) => setWeights({ ...weights, costWeight: Number(e.target.value) })}
              className="mt-2 w-full accent-blue-600"
            />
            <div className="mt-1 text-[10px] text-slate-500">(Lowest / Landed) × 100</div>
          </div>

          {/* Weight 2: Product Quality */}
          <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Product Quality</span>
              <span className="font-mono text-blue-600 font-bold">{weights.qualityWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={weights.qualityWeight}
              onChange={(e) => setWeights({ ...weights, qualityWeight: Number(e.target.value) })}
              className="mt-2 w-full accent-blue-600"
            />
            <div className="mt-1 text-[10px] text-slate-500">Audited QA Score (0-100)</div>
          </div>

          {/* Weight 3: Delivery Performance */}
          <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Delivery Time</span>
              <span className="font-mono text-blue-600 font-bold">{weights.deliveryWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={weights.deliveryWeight}
              onChange={(e) => setWeights({ ...weights, deliveryWeight: Number(e.target.value) })}
              className="mt-2 w-full accent-blue-600"
            />
            <div className="mt-1 text-[10px] text-slate-500">Target vs Promised Lead Time</div>
          </div>

          {/* Weight 4: Payment Terms */}
          <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Payment Terms</span>
              <span className="font-mono text-blue-600 font-bold">{weights.paymentWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={weights.paymentWeight}
              onChange={(e) => setWeights({ ...weights, paymentWeight: Number(e.target.value) })}
              className="mt-2 w-full accent-blue-600"
            />
            <div className="mt-1 text-[10px] text-slate-500">Credit Days vs 45d Target</div>
          </div>

          {/* Weight 5: Supplier Reliability */}
          <div className="rounded-lg bg-slate-50/70 p-3 border border-slate-100">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span>Reliability</span>
              <span className="font-mono text-blue-600 font-bold">{weights.reliabilityWeight}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              value={weights.reliabilityWeight}
              onChange={(e) => setWeights({ ...weights, reliabilityWeight: Number(e.target.value) })}
              className="mt-2 w-full accent-blue-600"
            />
            <div className="mt-1 text-[10px] text-slate-500">Fulfillment Track Record</div>
          </div>
        </div>
      </div>

      {/* Deterministic Evaluation Results Ranking Table */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs">
        <div className="border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">
            Deterministic Scoring Results & Weighted Contribution
          </h2>
          <p className="text-xs text-slate-500">
            Calculated strictly from verified quotation figures and historical supplier performance ratings
          </p>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/80 font-semibold text-slate-700">
              <tr>
                <th className="px-4 py-3 text-center">Rank</th>
                <th className="px-4 py-3">Supplier Name</th>
                <th className="px-4 py-3 text-right">Landed Cost</th>
                <th className="px-4 py-3 text-center">Cost ({weights.costWeight}%)</th>
                <th className="px-4 py-3 text-center">Quality ({weights.qualityWeight}%)</th>
                <th className="px-4 py-3 text-center">Delivery ({weights.deliveryWeight}%)</th>
                <th className="px-4 py-3 text-center">Payment ({weights.paymentWeight}%)</th>
                <th className="px-4 py-3 text-center">Reliability ({weights.reliabilityWeight}%)</th>
                <th className="px-4 py-3 text-center">Final Score</th>
                <th className="px-4 py-3 text-center">Data Integrity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {evaluations.map((ev) => (
                <tr
                  key={ev.evaluationId}
                  className={`hover:bg-slate-50/60 transition-colors ${
                    ev.ranking === 1 ? 'bg-blue-50/30 font-semibold' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        ev.ranking === 1
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      #{ev.ranking}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{ev.vendorName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {ev.deliveryDays}d delivery · {ev.creditDays}d credit
                    </div>
                  </td>

                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    ₹{ev.totalLandedCost.toLocaleString('en-IN')}
                    <div className="text-[11px] font-normal text-slate-500">₹{ev.landedCostPerUnit}/unit</div>
                  </td>

                  <td className="px-4 py-3 text-center font-mono">
                    <span className="font-semibold">{ev.costScore}</span>
                    <span className="text-[10px] text-slate-400 block">
                      +{(ev.costScore * (weights.costWeight / 100)).toFixed(1)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center font-mono">
                    <span className="font-semibold">{ev.qualityScore}</span>
                    <span className="text-[10px] text-slate-400 block">
                      +{(ev.qualityScore * (weights.qualityWeight / 100)).toFixed(1)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center font-mono">
                    <span className={`font-semibold ${ev.deliveryScore === 100 ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {ev.deliveryScore}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      +{(ev.deliveryScore * (weights.deliveryWeight / 100)).toFixed(1)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center font-mono">
                    <span className="font-semibold">{ev.paymentScore}</span>
                    <span className="text-[10px] text-slate-400 block">
                      +{(ev.paymentScore * (weights.paymentWeight / 100)).toFixed(1)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center font-mono">
                    <span className="font-semibold">{ev.reliabilityScore}</span>
                    <span className="text-[10px] text-slate-400 block">
                      +{(ev.reliabilityScore * (weights.reliabilityWeight / 100)).toFixed(1)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-md px-2.5 py-1 text-sm font-extrabold font-mono tabular-nums ${
                      ev.ranking === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'
                    }`}>
                      {ev.weightedScore}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className="inline-block rounded bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                      {ev.dataCompleteness}% Verified
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Recommendation Showcase Card */}
      {rfqRecommendation ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-900 p-3 text-white shadow-2xs">
                <Sparkles className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Recommended Supplier Proposal
                </span>
                <h3 className="text-xl font-extrabold text-slate-900">
                  {rfqRecommendation.recommendedVendorName}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-xs text-slate-500">Overall Weighted Score</span>
                <div className="text-2xl font-extrabold font-mono text-blue-600 tabular-nums">
                  {rfqRecommendation.recommendedScore}/100
                </div>
              </div>

              <div className="rounded-lg bg-emerald-50 px-3 py-1.5 border border-emerald-200 text-xs font-bold text-emerald-800">
                Confidence: {rfqRecommendation.confidenceLevel}
              </div>
            </div>
          </div>

          {/* AI Justification Sections */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 text-xs">
            {/* Why Selected */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Why This Supplier Was Selected
              </h4>
              <p className="text-slate-700 leading-relaxed">
                {rfqRecommendation.whySelected}
              </p>
            </div>

            {/* Commercial Evaluation */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                Commercial & Working Capital Evaluation
              </h4>
              <p className="text-slate-700 leading-relaxed">
                {rfqRecommendation.commercialEvaluation}
              </p>
            </div>

            {/* Operational Evaluation */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-indigo-600" />
                Operational & Delivery Lead Time Assessment
              </h4>
              <p className="text-slate-700 leading-relaxed">
                {rfqRecommendation.operationalEvaluation}
              </p>
            </div>

            {/* Potential Risks */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-1.5">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Procurement Risks & Mitigation Notes
              </h4>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                {rfqRecommendation.potentialRisks.map((risk, i) => (
                  <li key={i}>{risk}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Alternative Supplier Scenario */}
          {rfqRecommendation.alternativeVendorName && (
            <div className="rounded-lg border border-slate-200/80 bg-slate-50/60 p-4 text-xs">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>Secondary Option / Dual-Sourcing Alternative:</span>
                <span className="font-mono text-blue-600">
                  {rfqRecommendation.alternativeVendorName} (Score: {rfqRecommendation.alternativeScore}/100)
                </span>
              </div>
              <p className="mt-1 text-slate-600 leading-relaxed">
                {rfqRecommendation.alternativeScenario}
              </p>
            </div>
          )}

          {/* Final Executive Insight */}
          <div className="rounded-xl bg-slate-900 p-4 text-white text-xs leading-relaxed flex items-start gap-3 shadow-2xs">
            <ShieldCheck className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-sm font-bold text-white mb-1">
                Final Procurement Committee Insight:
              </strong>
              {rfqRecommendation.finalProcurementInsight}
            </div>
          </div>

          {/* Human-In-The-Loop Approval Action */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-slate-700">Approval Status:</span>
              <span className={`rounded-md px-2 py-0.5 font-bold ${
                rfqRecommendation.approvalStatus === 'Approved'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {rfqRecommendation.approvalStatus}
              </span>
              {rfqRecommendation.approvedBy && (
                <span className="text-slate-500">by {rfqRecommendation.approvedBy}</span>
              )}
            </div>

            {hasPermission('APPROVE_AWARD') && rfqRecommendation.approvalStatus !== 'Approved' && (
              <button
                onClick={() => setIsApprovalModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition-colors"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Vendor Selection & Award PO
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-2xs">
          <Sparkles className="mx-auto h-8 w-8 text-blue-600" />
          <h3 className="mt-2 text-sm font-bold text-slate-900">AI Recommendation Ready to Generate</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Click <strong>"Generate AI Recommendation"</strong> to run Gemini’s multi-parameter risk and commercial synthesis on top of the deterministic scores above.
          </p>
          <button
            onClick={handleGenerateRecommendation}
            disabled={isGenerating || evaluations.length === 0}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
          >
            {isGenerating ? 'Synthesizing...' : 'Generate AI Recommendation Now'}
          </button>
        </div>
      )}

      {/* Human Approval Modal */}
      {isApprovalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Authorize Vendor Award</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              You are approving the procurement award of <strong>{selectedRfq?.title}</strong> to <strong>{rfqRecommendation?.recommendedVendorName}</strong> for total landed amount of <strong>₹{topVendor?.totalLandedCost.toLocaleString('en-IN')}</strong>.
            </p>
            <div className="mt-4 rounded-lg bg-slate-50 p-3 text-[11px] text-slate-600 border border-slate-100">
              This action will be formally recorded in the immutable audit log under your user ID.
            </div>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setIsApprovalModalOpen(false)}
                className="rounded-md border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleApproveAward}
                className="rounded-md bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
              >
                Confirm & Authorize
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
