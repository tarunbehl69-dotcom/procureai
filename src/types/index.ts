export type UserRole = 
  | 'Administrator' 
  | 'Procurement Manager' 
  | 'Procurement Executive' 
  | 'Finance Reviewer' 
  | 'Viewer';

export interface User {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  organisationId: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Organisation {
  organisationId: string;
  organisationName: string;
  industry: string;
  currency: string; // e.g. 'INR', 'USD'
  currencySymbol: string; // e.g. '₹', '$'
  createdAt: string;
}

export type PurchaseRequestStatus = 
  | 'Draft' 
  | 'Submitted' 
  | 'Under Review' 
  | 'Approved' 
  | 'Rejected' 
  | 'Converted to RFQ';

export interface PurchaseRequest {
  requestId: string;
  requestNumber: string;
  requestedBy: string;
  materialName: string;
  category: string;
  quantity: number;
  unit: string;
  budget: number;
  requiredDeliveryDate: string; // YYYY-MM-DD
  specifications: string;
  remarks?: string;
  status: PurchaseRequestStatus;
  linkedRfqId?: string;
  createdAt: string;
}

export type RfqStatus = 
  | 'Draft' 
  | 'Sent' 
  | 'Awaiting Response' 
  | 'Responses Received' 
  | 'Evaluation in Progress' 
  | 'Completed' 
  | 'Cancelled';

export interface RFQ {
  rfqId: string;
  rfqNumber: string;
  purchaseRequestId?: string;
  title: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  selectedVendorIds: string[];
  submissionDeadline: string; // YYYY-MM-DD
  requiredDeliveryDate: string; // YYYY-MM-DD
  deliveryLeadTimeDays: number; // e.g. 15
  commercialConditions: string;
  status: RfqStatus;
  awardedVendorId?: string;
  createdAt: string;
}

export type VendorStatus = 'Active' | 'Under Review' | 'Inactive' | 'Blacklisted';

export interface Vendor {
  vendorId: string;
  vendorName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  category: string;
  gstin?: string;
  pan?: string;
  yearsInBusiness: number;
  productsSupplied: string[];
  qualityRating: number; // 0-100
  onTimeDeliveryRate: number; // 0-100%
  reliabilityScore: number; // 0-100
  previousTransactionRecordsCount: number;
  status: VendorStatus;
  createdAt: string;
}

export interface QuotationExtractedData {
  vendorName: string;
  quotationNumber: string;
  quotationDate: string;
  validityDate: string;
  productName: string;
  specifications: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  basicAmount: number;
  discountPercent: number;
  discountAmount: number;
  netBasicAmount: number;
  gstPercent: number;
  gstAmount: number;
  freightCharges: number;
  insuranceCharges: number;
  otherCharges: number;
  totalQuotationValue: number;
  paymentTerms: string;
  creditPeriodDays: number;
  estimatedDeliveryDays: number;
  deliveryLocation: string;
  shippingConditions: string;
  extractionConfidence: number; // 0-100
  sourceReferences: Record<string, string>;
  warnings: string[];
}

export type ExtractionStatus = 'Pending' | 'Extracted' | 'Failed';
export type VerificationStatus = 'Unverified' | 'Verified' | 'Flagged';

export interface Quotation {
  quotationId: string;
  rfqId: string;
  vendorId: string;
  fileName: string;
  fileSize?: string;
  fileType?: string;
  fileUrl?: string;
  quotationNumber: string;
  quotationDate: string;
  validityDate: string;
  extractedData: QuotationExtractedData;
  extractionStatus: ExtractionStatus;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface ScoringWeights {
  costWeight: number; // e.g. 35
  qualityWeight: number; // e.g. 25
  deliveryWeight: number; // e.g. 20
  paymentWeight: number; // e.g. 10
  reliabilityWeight: number; // e.g. 10
  targetCreditDays: number; // e.g. 45
}

export interface VendorEvaluationResult {
  evaluationId: string;
  rfqId: string;
  vendorId: string;
  vendorName: string;
  unitPrice: number;
  quantity: number;
  netBasicAmount: number;
  gstAmount: number;
  freightCharges: number;
  insuranceCharges: number;
  otherCharges: number;
  totalLandedCost: number;
  landedCostPerUnit: number;
  deliveryDays: number;
  creditDays: number;
  costScore: number;
  qualityScore: number;
  deliveryScore: number;
  paymentScore: number;
  reliabilityScore: number;
  weightedScore: number;
  ranking: number;
  dataCompleteness: number; // 0-100%
  scoreExplanations: {
    cost: string;
    quality: string;
    delivery: string;
    payment: string;
    reliability: string;
  };
  missingDataWarnings: string[];
}

export interface AiRecommendation {
  recommendationId: string;
  rfqId: string;
  recommendedVendorId: string;
  recommendedVendorName: string;
  recommendedScore: number;
  alternativeVendorId?: string;
  alternativeVendorName?: string;
  alternativeScore?: number;
  whySelected: string;
  commercialEvaluation: string;
  operationalEvaluation: string;
  potentialRisks: string[];
  alternativeScenario: string;
  finalProcurementInsight: string;
  confidenceLevel: 'High' | 'Moderate' | 'Advisory';
  dataCompletenessScore: number;
  approvalStatus: 'Pending Review' | 'Approved' | 'Rejected' | 'Sent for Renegotiation';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface ContractClause {
  clauseType: string;
  clauseTitle: string;
  summary: string;
  riskSeverity: 'Low' | 'Medium' | 'High';
  isAmbiguous?: boolean;
  pageReference?: string;
  rawText?: string;
}

export interface Contract {
  contractId: string;
  vendorId: string;
  vendorName: string;
  contractTitle: string;
  contractNumber: string;
  contractValue: number;
  effectiveDate: string;
  expiryDate: string;
  paymentTerms: string;
  deliveryObligations: string;
  penaltyClausesSummary: string;
  warrantyPeriod: string;
  renewalNoticeDays: number;
  extractedClauses: ContractClause[];
  riskFindings: string[];
  reviewStatus: 'Draft' | 'Under Legal Review' | 'Approved' | 'Needs Amendment' | 'Expired';
  createdAt: string;
}

export interface Transaction {
  transactionId: string;
  vendorId: string;
  vendorName: string;
  category: string;
  materialName: string;
  quantity: number;
  unit: string;
  amount: number;
  unitPrice: number;
  transactionDate: string;
  invoiceNumber: string;
  purchaseOrderNumber: string;
  paymentStatus: 'Paid' | 'Pending' | 'Overdue';
}

export interface AuditLog {
  logId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  entityType: 'RFQ' | 'PurchaseRequest' | 'Vendor' | 'Quotation' | 'Evaluation' | 'Contract' | 'Settings' | 'Recommendation';
  entityId: string;
  details: string;
  timestamp: string;
}

export interface AppSettings {
  organisation: Organisation;
  scoringWeights: ScoringWeights;
  taxConfig: {
    isGstRecoverable: boolean; // default true in India manufacturing
    gstTreatmentExplanation: string;
  };
  deliveryRules: {
    onTimeScore: number; // 100
    upTo3DaysLateScore: number; // 80
    fourTo7DaysLateScore: number; // 60
    eightTo14DaysLateScore: number; // 30
    moreThan14DaysLateScore: number; // 0
  };
  aiEnabled: boolean;
  activeModelName: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: Array<{ label: string; details: string }>;
  suggestedActions?: string[];
}
