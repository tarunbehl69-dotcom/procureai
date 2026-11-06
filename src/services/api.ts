import {
  RFQ,
  PurchaseRequest,
  Vendor,
  Quotation,
  Contract,
  Transaction,
  AppSettings,
  AuditLog,
  AiRecommendation,
  VendorEvaluationResult,
  ScoringWeights,
} from '../types';

export const api = {
  // State
  async fetchState() {
    const res = await fetch('/api/state');
    if (!res.ok) throw new Error('Failed to load application state');
    return res.json();
  },

  async resetDemoData() {
    const res = await fetch('/api/reset-demo', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset demo data');
    return res.json();
  },

  // RFQs
  async getRfqs(): Promise<RFQ[]> {
    const res = await fetch('/api/rfqs');
    if (!res.ok) throw new Error('Failed to fetch RFQs');
    return res.json();
  },

  async createRfq(rfq: Partial<RFQ>): Promise<RFQ> {
    const res = await fetch('/api/rfqs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rfq),
    });
    if (!res.ok) throw new Error('Failed to create RFQ');
    return res.json();
  },

  async updateRfq(id: string, updates: Partial<RFQ>): Promise<RFQ> {
    const res = await fetch(`/api/rfqs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update RFQ');
    return res.json();
  },

  async deleteRfq(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/rfqs/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete RFQ');
    return res.json();
  },

  // Purchase Requests
  async getPurchaseRequests(): Promise<PurchaseRequest[]> {
    const res = await fetch('/api/purchase-requests');
    if (!res.ok) throw new Error('Failed to fetch purchase requests');
    return res.json();
  },

  async createPurchaseRequest(pr: Partial<PurchaseRequest>): Promise<PurchaseRequest> {
    const res = await fetch('/api/purchase-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pr),
    });
    if (!res.ok) throw new Error('Failed to create purchase request');
    return res.json();
  },

  async updatePurchaseRequest(id: string, updates: Partial<PurchaseRequest>): Promise<PurchaseRequest> {
    const res = await fetch(`/api/purchase-requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update purchase request');
    return res.json();
  },

  // Vendors
  async getVendors(): Promise<Vendor[]> {
    const res = await fetch('/api/vendors');
    if (!res.ok) throw new Error('Failed to fetch vendors');
    return res.json();
  },

  async createVendor(vendor: Partial<Vendor>): Promise<Vendor> {
    const res = await fetch('/api/vendors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendor),
    });
    if (!res.ok) throw new Error('Failed to create vendor');
    return res.json();
  },

  async updateVendor(id: string, updates: Partial<Vendor>): Promise<Vendor> {
    const res = await fetch(`/api/vendors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update vendor');
    return res.json();
  },

  // Quotations
  async getQuotations(): Promise<Quotation[]> {
    const res = await fetch('/api/quotations');
    if (!res.ok) throw new Error('Failed to fetch quotations');
    return res.json();
  },

  async createQuotation(quotation: Partial<Quotation>): Promise<Quotation> {
    const res = await fetch('/api/quotations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quotation),
    });
    if (!res.ok) throw new Error('Failed to create quotation');
    return res.json();
  },

  async updateQuotation(id: string, updates: Partial<Quotation>): Promise<Quotation> {
    const res = await fetch(`/api/quotations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update quotation');
    return res.json();
  },

  // Contracts
  async getContracts(): Promise<Contract[]> {
    const res = await fetch('/api/contracts');
    if (!res.ok) throw new Error('Failed to fetch contracts');
    return res.json();
  },

  async createContract(contract: Partial<Contract>): Promise<Contract> {
    const res = await fetch('/api/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contract),
    });
    if (!res.ok) throw new Error('Failed to create contract');
    return res.json();
  },

  async updateContract(id: string, updates: Partial<Contract>): Promise<Contract> {
    const res = await fetch(`/api/contracts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update contract');
    return res.json();
  },

  // Transactions
  async getTransactions(): Promise<Transaction[]> {
    const res = await fetch('/api/transactions');
    if (!res.ok) throw new Error('Failed to fetch transactions');
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Settings
  async getSettings(): Promise<AppSettings> {
    const res = await fetch('/api/settings');
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  },

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const res = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Failed to update settings');
    return res.json();
  },

  // Recommendations
  async getRecommendation(rfqId: string): Promise<AiRecommendation | null> {
    const res = await fetch(`/api/recommendations/${rfqId}`);
    if (!res.ok) return null;
    return res.json();
  },

  async saveRecommendation(rec: AiRecommendation): Promise<AiRecommendation> {
    const res = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rec),
    });
    if (!res.ok) throw new Error('Failed to save recommendation');
    return res.json();
  },

  // AI Endpoints
  async extractQuotationWithGemini(params: {
    documentText?: string;
    fileName: string;
    rfqTitle?: string;
    expectedQuantity?: number;
  }) {
    const res = await fetch('/api/gemini/extract-quotation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Gemini quotation extraction failed');
    return res.json();
  },

  async generateAiRecommendation(params: {
    rfq: RFQ;
    evaluations: VendorEvaluationResult[];
    weights: ScoringWeights;
    isGstRecoverable: boolean;
  }): Promise<AiRecommendation> {
    const res = await fetch('/api/gemini/recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Gemini recommendation generation failed');
    return res.json();
  },

  async reviewContractWithGemini(params: {
    contractTitle: string;
    vendorName: string;
    contractText?: string;
  }) {
    const res = await fetch('/api/gemini/contract-review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Gemini contract review failed');
    return res.json();
  },

  async getSpendInsightsWithGemini(params: {
    totalSpend: string;
    topCategories: any[];
    topVendors: any[];
    transactionSummary: any[];
  }) {
    const res = await fetch('/api/gemini/spend-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Gemini spend insights failed');
    return res.json();
  },

  async sendAssistantMessage(message: string, history: any[] = []) {
    const res = await fetch('/api/gemini/assistant-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error('Assistant query failed');
    return res.json();
  },

  // Backend Architecture & Database Telemetry
  async getBackendInfo() {
    const res = await fetch('/api/backend-info');
    if (!res.ok) throw new Error('Failed to retrieve backend information');
    return res.json();
  },

  async getPurchaseOrders() {
    const res = await fetch('/api/purchase-orders');
    if (!res.ok) throw new Error('Failed to load purchase orders');
    return res.json();
  },

  downloadDatabaseBackup() {
    window.location.href = '/api/export/database';
  },
};
