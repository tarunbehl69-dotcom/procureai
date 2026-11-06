import { Quotation, RFQ, Vendor, ScoringWeights, AppSettings, VendorEvaluationResult } from '../types';

export interface LandedCostBreakdown {
  quantity: number;
  unitPrice: number;
  basicAmount: number;
  discountAmount: number;
  netBasicAmount: number;
  gstPercent: number;
  gstAmount: number;
  isGstRecoverable: boolean;
  freightCharges: number;
  insuranceCharges: number;
  otherCharges: number;
  totalLandedCost: number;
  landedCostPerUnit: number;
}

export function calculateLandedCost(
  quotation: Quotation,
  isGstRecoverable: boolean = true
): LandedCostBreakdown {
  const data = quotation.extractedData;
  const quantity = Math.max(1, data.quantity || 1);
  const unitPrice = Math.max(0, data.unitPrice || 0);
  const basicAmount = quantity * unitPrice;

  // Calculate discount
  let discountAmount = 0;
  if (data.discountAmount && data.discountAmount > 0) {
    discountAmount = data.discountAmount;
  } else if (data.discountPercent && data.discountPercent > 0) {
    discountAmount = (basicAmount * data.discountPercent) / 100;
  }

  const netBasicAmount = Math.max(0, basicAmount - discountAmount);
  const gstPercent = data.gstPercent || 18;
  const gstAmount = data.gstAmount && data.gstAmount > 0 
    ? data.gstAmount 
    : (netBasicAmount * gstPercent) / 100;

  const freightCharges = Math.max(0, data.freightCharges || 0);
  const insuranceCharges = Math.max(0, data.insuranceCharges || 0);
  const otherCharges = Math.max(0, data.otherCharges || 0);

  // If GST is recoverable (ITC), it is NOT part of landed cost.
  // If non-recoverable, it is added to landed cost.
  const taxComponent = isGstRecoverable ? 0 : gstAmount;
  const totalLandedCost = Math.round(netBasicAmount + taxComponent + freightCharges + insuranceCharges + otherCharges);
  const landedCostPerUnit = Number((totalLandedCost / quantity).toFixed(2));

  return {
    quantity,
    unitPrice,
    basicAmount,
    discountAmount,
    netBasicAmount,
    gstPercent,
    gstAmount,
    isGstRecoverable,
    freightCharges,
    insuranceCharges,
    otherCharges,
    totalLandedCost,
    landedCostPerUnit,
  };
}

export function calculateDeliveryScore(
  promisedDays: number,
  targetDays: number,
  rules: AppSettings['deliveryRules'] = {
    onTimeScore: 100,
    upTo3DaysLateScore: 80,
    fourTo7DaysLateScore: 60,
    eightTo14DaysLateScore: 30,
    moreThan14DaysLateScore: 0,
  }
): { score: number; explanation: string } {
  const delay = promisedDays - targetDays;
  if (delay <= 0) {
    return {
      score: rules.onTimeScore,
      explanation: promisedDays < targetDays 
        ? `Delivers in ${promisedDays} days (${Math.abs(delay)} days ahead of required ${targetDays} days)`
        : `Delivers exactly on time in ${promisedDays} days (target: ${targetDays} days)`
    };
  }
  if (delay <= 3) {
    return {
      score: rules.upTo3DaysLateScore,
      explanation: `Minor delay: ${promisedDays} days vs target ${targetDays} days (+${delay} days late)`
    };
  }
  if (delay <= 7) {
    return {
      score: rules.fourTo7DaysLateScore,
      explanation: `Moderate delay: ${promisedDays} days vs target ${targetDays} days (+${delay} days late)`
    };
  }
  if (delay <= 14) {
    return {
      score: rules.eightTo14DaysLateScore,
      explanation: `Significant delay: ${promisedDays} days vs target ${targetDays} days (+${delay} days late)`
    };
  }
  return {
    score: rules.moreThan14DaysLateScore,
    explanation: `Severe delay: ${promisedDays} days exceeds required delivery by ${delay} days`
  };
}

export function evaluateVendorsForRfq(
  rfq: RFQ,
  quotations: Quotation[],
  vendors: Vendor[],
  weights: ScoringWeights,
  isGstRecoverable: boolean = true,
  deliveryRules?: AppSettings['deliveryRules']
): VendorEvaluationResult[] {
  if (quotations.length === 0) return [];

  const vendorMap = new Map<string, Vendor>();
  vendors.forEach(v => vendorMap.set(v.vendorId, v));

  // Step 1: Calculate landed cost for all quotations
  const computedList = quotations.map(q => {
    const vendor = vendorMap.get(q.vendorId);
    const landed = calculateLandedCost(q, isGstRecoverable);
    return {
      quotation: q,
      vendor,
      landed,
    };
  });

  // Step 2: Find lowest landed cost for Cost Score baseline
  const minLandedCost = Math.min(...computedList.map(item => item.landed.totalLandedCost));

  // Step 3: Compute each vendor's individual scores
  const results: VendorEvaluationResult[] = computedList.map(item => {
    const { quotation: q, vendor, landed } = item;
    const vendorName = vendor?.vendorName || q.extractedData.vendorName || 'Unknown Vendor';
    const missingWarnings: string[] = [];
    let fieldsPresent = 0;
    const totalFields = 5;

    // A. Cost Score = (Lowest Landed Cost / Vendor Landed Cost) * 100
    let costScore = 0;
    if (landed.totalLandedCost > 0) {
      costScore = Number(((minLandedCost / landed.totalLandedCost) * 100).toFixed(1));
      fieldsPresent++;
    } else {
      missingWarnings.push('Missing pricing or landed cost');
    }

    // B. Quality Score (0-100)
    let qualityScore = 0;
    if (vendor && typeof vendor.qualityRating === 'number' && vendor.qualityRating > 0) {
      qualityScore = vendor.qualityRating;
      fieldsPresent++;
    } else {
      qualityScore = 70; // baseline if unverified
      missingWarnings.push('No verified vendor quality audit on record; estimated baseline applied');
    }

    // C. Delivery Score
    const promisedDays = q.extractedData.estimatedDeliveryDays || rfq.deliveryLeadTimeDays || 15;
    const targetDays = rfq.deliveryLeadTimeDays || 15;
    const deliveryEval = calculateDeliveryScore(promisedDays, targetDays, deliveryRules);
    const deliveryScore = deliveryEval.score;
    fieldsPresent++;

    // D. Payment Score = MIN(Credit Days / Target Credit Days, 1) * 100
    const creditDays = q.extractedData.creditPeriodDays || 0;
    const targetCreditDays = weights.targetCreditDays || 45;
    const paymentScore = Number((Math.min(1, creditDays / targetCreditDays) * 100).toFixed(1));
    fieldsPresent++;

    // E. Reliability Score (0-100)
    let reliabilityScore = 0;
    if (vendor && typeof vendor.reliabilityScore === 'number' && vendor.reliabilityScore > 0) {
      reliabilityScore = vendor.reliabilityScore;
      fieldsPresent++;
    } else {
      reliabilityScore = 70;
      missingWarnings.push('Historical transaction reliability data unavailable');
    }

    // Normalized Weights Check
    const totalWeight = weights.costWeight + weights.qualityWeight + weights.deliveryWeight + weights.paymentWeight + weights.reliabilityWeight;
    const wCost = weights.costWeight / totalWeight;
    const wQuality = weights.qualityWeight / totalWeight;
    const wDelivery = weights.deliveryWeight / totalWeight;
    const wPayment = weights.paymentWeight / totalWeight;
    const wReliability = weights.reliabilityWeight / totalWeight;

    // Final Weighted Score
    const weightedScore = Number((
      (costScore * wCost) +
      (qualityScore * wQuality) +
      (deliveryScore * wDelivery) +
      (paymentScore * wPayment) +
      (reliabilityScore * wReliability)
    ).toFixed(2));

    const dataCompleteness = Math.round((fieldsPresent / totalFields) * 100);

    const costDiffPct = minLandedCost > 0 
      ? (((landed.totalLandedCost - minLandedCost) / minLandedCost) * 100).toFixed(1)
      : '0';

    return {
      evaluationId: `eval-${q.quotationId}`,
      rfqId: rfq.rfqId,
      vendorId: q.vendorId,
      vendorName,
      unitPrice: landed.unitPrice,
      quantity: landed.quantity,
      netBasicAmount: landed.netBasicAmount,
      gstAmount: landed.gstAmount,
      freightCharges: landed.freightCharges,
      insuranceCharges: landed.insuranceCharges,
      otherCharges: landed.otherCharges,
      totalLandedCost: landed.totalLandedCost,
      landedCostPerUnit: landed.landedCostPerUnit,
      deliveryDays: promisedDays,
      creditDays,
      costScore,
      qualityScore,
      deliveryScore,
      paymentScore,
      reliabilityScore,
      weightedScore,
      ranking: 0, // assigned after sorting
      dataCompleteness,
      scoreExplanations: {
        cost: landed.totalLandedCost === minLandedCost
          ? `Lowest landed cost in RFQ (${costScore}/100)`
          : `+${costDiffPct}% higher than lowest bidder (${costScore}/100)`,
        quality: `Verified ISO/Quality rating: ${qualityScore}/100`,
        delivery: deliveryEval.explanation,
        payment: `${creditDays} days credit vs ${targetCreditDays} days target (${paymentScore}/100)`,
        reliability: `Historical fulfillment index: ${reliabilityScore}/100`,
      },
      missingDataWarnings: missingWarnings,
    };
  });

  // Step 4: Rank results descending by weighted score
  results.sort((a, b) => b.weightedScore - a.weightedScore);
  results.forEach((item, index) => {
    item.ranking = index + 1;
  });

  return results;
}
