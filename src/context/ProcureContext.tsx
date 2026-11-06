import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  User,
  UserRole,
  Organisation,
  RFQ,
  PurchaseRequest,
  Vendor,
  Quotation,
  Contract,
  Transaction,
  AuditLog,
  AppSettings,
  AiRecommendation,
  VendorEvaluationResult,
} from '../types';
import { api } from '../services/api';
import { evaluateVendorsForRfq } from '../utils/procurementCalculations';
import {
  initialOrganisation,
  initialUsers,
  initialVendors,
  initialPurchaseRequests,
  initialRfqs,
  initialQuotations,
  initialContracts,
  initialTransactions,
  initialAppSettings,
  initialAuditLogs,
} from '../data/mockData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

interface ProcureContextType {
  currentUser: User;
  switchRole: (role: UserRole) => void;
  availableUsers: User[];
  organisation: Organisation;
  rfqs: RFQ[];
  purchaseRequests: PurchaseRequest[];
  vendors: Vendor[];
  quotations: Quotation[];
  contracts: Contract[];
  transactions: Transaction[];
  auditLogs: AuditLog[];
  settings: AppSettings;
  selectedRfqId: string;
  setSelectedRfqId: (id: string) => void;
  selectedRfq: RFQ | undefined;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type'], title?: string) => void;
  removeToast: (id: string) => void;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  resetAllDemoData: () => Promise<void>;
  
  // Actions
  createPurchaseRequest: (data: Partial<PurchaseRequest>) => Promise<PurchaseRequest>;
  updatePurchaseRequest: (id: string, updates: Partial<PurchaseRequest>) => Promise<void>;
  createRfq: (data: Partial<RFQ>) => Promise<RFQ>;
  updateRfq: (id: string, updates: Partial<RFQ>) => Promise<void>;
  deleteRfq: (id: string) => Promise<void>;
  createVendor: (data: Partial<Vendor>) => Promise<Vendor>;
  updateVendor: (id: string, updates: Partial<Vendor>) => Promise<void>;
  createQuotation: (data: Partial<Quotation>) => Promise<Quotation>;
  updateQuotation: (id: string, updates: Partial<Quotation>) => Promise<void>;
  createContract: (data: Partial<Contract>) => Promise<Contract>;
  updateContract: (id: string, updates: Partial<Contract>) => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  
  // Scoring & AI
  getEvaluationsForRfq: (rfqId: string) => VendorEvaluationResult[];
  rfqRecommendation: AiRecommendation | null;
  setRfqRecommendation: (rec: AiRecommendation | null) => void;
  hasPermission: (action: 'CREATE_PR' | 'APPROVE_PR' | 'CREATE_RFQ' | 'EVALUATE' | 'APPROVE_AWARD' | 'EDIT_SETTINGS' | 'MANAGE_USERS') => boolean;
}

const ProcureContext = createContext<ProcureContextType | undefined>(undefined);

export const ProcureProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [organisation, setOrganisation] = useState<Organisation>(initialOrganisation);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[1]); // Default: Ananya Deshmukh (Procurement Manager)
  const [rfqs, setRfqs] = useState<RFQ[]>(initialRfqs);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(initialPurchaseRequests);
  const [vendors, setVendors] = useState<Vendor[]>(initialVendors);
  const [quotations, setQuotations] = useState<Quotation[]>(initialQuotations);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [settings, setSettings] = useState<AppSettings>(initialAppSettings);
  const [selectedRfqId, setSelectedRfqId] = useState<string>('rfq-2026-001');
  const [rfqRecommendation, setRfqRecommendation] = useState<AiRecommendation | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const showToast = (message: string, type: ToastMessage['type'] = 'info', title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshData = async () => {
    try {
      setIsLoading(true);
      const state = await api.fetchState();
      if (state) {
        if (state.users) setUsers(state.users);
        if (state.rfqs) setRfqs(state.rfqs);
        if (state.purchaseRequests) setPurchaseRequests(state.purchaseRequests);
        if (state.vendors) setVendors(state.vendors);
        if (state.quotations) setQuotations(state.quotations);
        if (state.contracts) setContracts(state.contracts);
        if (state.transactions) setTransactions(state.transactions);
        if (state.auditLogs) setAuditLogs(state.auditLogs);
        if (state.settings) setSettings(state.settings);
      }
    } catch {
      // Backend is ready or fallback to local in-memory
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const switchRole = (role: UserRole) => {
    const matching = users.find(u => u.role === role);
    if (matching) {
      setCurrentUser(matching);
      showToast(`Switched active user to ${matching.name} (${role})`, 'info');
    } else {
      setCurrentUser(prev => ({ ...prev, role }));
      showToast(`Role updated to ${role}`, 'info');
    }
  };

  const hasPermission = (action: 'CREATE_PR' | 'APPROVE_PR' | 'CREATE_RFQ' | 'EVALUATE' | 'APPROVE_AWARD' | 'EDIT_SETTINGS' | 'MANAGE_USERS'): boolean => {
    const role = currentUser.role;
    if (role === 'Administrator') return true;
    switch (action) {
      case 'CREATE_PR':
        return ['Administrator', 'Procurement Manager', 'Procurement Executive'].includes(role);
      case 'APPROVE_PR':
        return ['Administrator', 'Procurement Manager'].includes(role);
      case 'CREATE_RFQ':
        return ['Administrator', 'Procurement Manager', 'Procurement Executive'].includes(role);
      case 'EVALUATE':
        return ['Administrator', 'Procurement Manager', 'Procurement Executive', 'Finance Reviewer'].includes(role);
      case 'APPROVE_AWARD':
        return ['Administrator', 'Procurement Manager'].includes(role);
      case 'EDIT_SETTINGS':
        return ['Administrator'].includes(role);
      case 'MANAGE_USERS':
        return ['Administrator'].includes(role);
      default:
        return false;
    }
  };

  const selectedRfq = useMemo(() => {
    return rfqs.find(r => r.rfqId === selectedRfqId) || rfqs[0];
  }, [rfqs, selectedRfqId]);

  const getEvaluationsForRfq = (rfqId: string): VendorEvaluationResult[] => {
    const targetRfq = rfqs.find(r => r.rfqId === rfqId);
    if (!targetRfq) return [];
    const rfqQuotes = quotations.filter(q => q.rfqId === rfqId && q.extractionStatus === 'Extracted');
    return evaluateVendorsForRfq(
      targetRfq,
      rfqQuotes,
      vendors,
      settings.scoringWeights,
      settings.taxConfig.isGstRecoverable,
      settings.deliveryRules
    );
  };

  const createPurchaseRequest = async (data: Partial<PurchaseRequest>): Promise<PurchaseRequest> => {
    try {
      const created = await api.createPurchaseRequest(data);
      setPurchaseRequests(prev => [created, ...prev]);
      showToast(`Purchase Request ${created.requestNumber} created successfully!`, 'success');
      return created;
    } catch {
      const fallbackPr: PurchaseRequest = {
        requestId: `pr-${Date.now()}`,
        requestNumber: `PR-2026-${String(purchaseRequests.length + 1).padStart(3, '0')}`,
        requestedBy: currentUser.name,
        materialName: data.materialName || 'Raw Material',
        category: data.category || 'Paper & Board',
        quantity: data.quantity || 1000,
        unit: data.unit || 'units',
        budget: data.budget || 100000,
        requiredDeliveryDate: data.requiredDeliveryDate || '2026-12-01',
        specifications: data.specifications || '',
        status: 'Submitted',
        createdAt: new Date().toISOString(),
      };
      setPurchaseRequests(prev => [fallbackPr, ...prev]);
      showToast(`Purchase Request ${fallbackPr.requestNumber} created!`, 'success');
      return fallbackPr;
    }
  };

  const updatePurchaseRequest = async (id: string, updates: Partial<PurchaseRequest>) => {
    try {
      await api.updatePurchaseRequest(id, updates);
    } catch {
      // local fallback
    }
    setPurchaseRequests(prev => prev.map(p => p.requestId === id ? { ...p, ...updates } : p));
    showToast('Purchase request updated', 'success');
  };

  const createRfq = async (data: Partial<RFQ>): Promise<RFQ> => {
    try {
      const created = await api.createRfq(data);
      setRfqs(prev => [created, ...prev]);
      setSelectedRfqId(created.rfqId);
      showToast(`RFQ ${created.rfqNumber} published successfully!`, 'success');
      return created;
    } catch {
      const fallbackRfq: RFQ = {
        rfqId: `rfq-${Date.now()}`,
        rfqNumber: `RFQ-2026-${String(rfqs.length + 1).padStart(3, '0')}`,
        title: data.title || 'New RFQ',
        description: data.description || '',
        category: data.category || 'Paper & Board',
        quantity: data.quantity || 10000,
        unit: data.unit || 'units',
        selectedVendorIds: data.selectedVendorIds || [],
        submissionDeadline: data.submissionDeadline || '2026-11-20',
        requiredDeliveryDate: data.requiredDeliveryDate || '2026-11-30',
        deliveryLeadTimeDays: data.deliveryLeadTimeDays || 15,
        commercialConditions: data.commercialConditions || 'Standard 18% GST with ITC eligibility.',
        status: 'Sent',
        createdAt: new Date().toISOString(),
      };
      setRfqs(prev => [fallbackRfq, ...prev]);
      setSelectedRfqId(fallbackRfq.rfqId);
      showToast(`RFQ ${fallbackRfq.rfqNumber} published!`, 'success');
      return fallbackRfq;
    }
  };

  const updateRfq = async (id: string, updates: Partial<RFQ>) => {
    try {
      await api.updateRfq(id, updates);
    } catch {
      // local fallback
    }
    setRfqs(prev => prev.map(r => r.rfqId === id ? { ...r, ...updates } : r));
    showToast('RFQ details updated', 'success');
  };

  const deleteRfq = async (id: string) => {
    try {
      await api.deleteRfq(id);
    } catch {
      // local fallback
    }
    setRfqs(prev => prev.filter(r => r.rfqId !== id));
    if (selectedRfqId === id && rfqs.length > 1) {
      const remaining = rfqs.filter(r => r.rfqId !== id);
      setSelectedRfqId(remaining[0].rfqId);
    }
    showToast('RFQ deleted', 'info');
  };

  const createVendor = async (data: Partial<Vendor>): Promise<Vendor> => {
    try {
      const created = await api.createVendor(data);
      setVendors(prev => [...prev, created]);
      showToast(`Vendor ${created.vendorName} onboarded successfully!`, 'success');
      return created;
    } catch {
      const fallbackVendor: Vendor = {
        vendorId: `vnd-${Date.now()}`,
        vendorName: data.vendorName || 'New Supplier',
        contactPerson: data.contactPerson || 'Contact Person',
        email: data.email || 'contact@supplier.in',
        phone: data.phone || '+91 98000 00000',
        address: data.address || 'Industrial Estate, India',
        category: data.category || 'Paper & Board',
        gstin: data.gstin || '',
        pan: data.pan || '',
        yearsInBusiness: data.yearsInBusiness || 5,
        productsSupplied: data.productsSupplied || ['Industrial Packaging Paper'],
        qualityRating: data.qualityRating || 85,
        onTimeDeliveryRate: data.onTimeDeliveryRate || 90,
        reliabilityScore: data.reliabilityScore || 85,
        previousTransactionRecordsCount: 0,
        status: data.status || 'Active',
        createdAt: new Date().toISOString(),
      };
      setVendors(prev => [...prev, fallbackVendor]);
      showToast(`Vendor ${fallbackVendor.vendorName} onboarded!`, 'success');
      return fallbackVendor;
    }
  };

  const updateVendor = async (id: string, updates: Partial<Vendor>) => {
    try {
      await api.updateVendor(id, updates);
    } catch {
      // local fallback
    }
    setVendors(prev => prev.map(v => v.vendorId === id ? { ...v, ...updates } : v));
    showToast('Vendor profile updated', 'success');
  };

  const createQuotation = async (data: Partial<Quotation>): Promise<Quotation> => {
    try {
      const created = await api.createQuotation(data);
      setQuotations(prev => [...prev, created]);
      showToast(`Quotation ${created.quotationNumber} uploaded and parsed!`, 'success');
      return created;
    } catch {
      const fallbackQuote: Quotation = {
        quotationId: `quot-${Date.now()}`,
        rfqId: data.rfqId || selectedRfqId,
        vendorId: data.vendorId || vendors[0]?.vendorId || 'vnd-alpha',
        fileName: data.fileName || 'Quotation.pdf',
        fileSize: data.fileSize || '320 KB',
        fileType: data.fileType || 'application/pdf',
        quotationNumber: data.quotationNumber || `QT-${Date.now().toString().slice(-5)}`,
        quotationDate: data.quotationDate || new Date().toISOString().split('T')[0],
        validityDate: data.validityDate || '2026-12-15',
        extractionStatus: 'Extracted',
        verificationStatus: 'Unverified',
        extractedData: data.extractedData || {} as any,
        createdAt: new Date().toISOString(),
      };
      setQuotations(prev => [...prev, fallbackQuote]);
      showToast(`Quotation ${fallbackQuote.quotationNumber} added!`, 'success');
      return fallbackQuote;
    }
  };

  const updateQuotation = async (id: string, updates: Partial<Quotation>) => {
    try {
      await api.updateQuotation(id, updates);
    } catch {
      // local fallback
    }
    setQuotations(prev => prev.map(q => q.quotationId === id ? { ...q, ...updates } : q));
    showToast('Quotation verified and saved', 'success');
  };

  const createContract = async (data: Partial<Contract>): Promise<Contract> => {
    try {
      const created = await api.createContract(data);
      setContracts(prev => [created, ...prev]);
      showToast(`Contract ${created.contractNumber} recorded!`, 'success');
      return created;
    } catch {
      const fallbackContract: Contract = {
        contractId: `cnt-${Date.now()}`,
        vendorId: data.vendorId || vendors[0]?.vendorId || 'vnd-alpha',
        vendorName: data.vendorName || vendors[0]?.vendorName || 'Supplier',
        contractTitle: data.contractTitle || 'Master Agreement',
        contractNumber: data.contractNumber || `MSA-2026-${Date.now().toString().slice(-4)}`,
        contractValue: data.contractValue || 10000000,
        effectiveDate: data.effectiveDate || '2026-01-01',
        expiryDate: data.expiryDate || '2026-12-31',
        paymentTerms: data.paymentTerms || '30 Days Net',
        deliveryObligations: data.deliveryObligations || 'Standard DDP',
        penaltyClausesSummary: data.penaltyClausesSummary || '0.5% per week',
        warrantyPeriod: data.warrantyPeriod || '12 Months',
        renewalNoticeDays: 45,
        extractedClauses: data.extractedClauses || [],
        riskFindings: data.riskFindings || [],
        reviewStatus: data.reviewStatus || 'Under Legal Review',
        createdAt: new Date().toISOString(),
      };
      setContracts(prev => [fallbackContract, ...prev]);
      showToast(`Contract ${fallbackContract.contractNumber} recorded!`, 'success');
      return fallbackContract;
    }
  };

  const updateContract = async (id: string, updates: Partial<Contract>) => {
    try {
      await api.updateContract(id, updates);
    } catch {
      // local fallback
    }
    setContracts(prev => prev.map(c => c.contractId === id ? { ...c, ...updates } : c));
    showToast('Contract updated', 'success');
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    try {
      const updated = await api.updateSettings(updates);
      setSettings(updated);
    } catch {
      setSettings(prev => ({ ...prev, ...updates }));
    }
    showToast('Procurement configuration saved', 'success');
  };

  const resetAllDemoData = async () => {
    try {
      await api.resetDemoData();
      await refreshData();
      setSelectedRfqId('rfq-2026-001');
      setRfqRecommendation(null);
      showToast('All demonstration records reset to initial state!', 'success');
    } catch {
      setOrganisation(initialOrganisation);
      setUsers(initialUsers);
      setCurrentUser(initialUsers[1]);
      setRfqs(initialRfqs);
      setPurchaseRequests(initialPurchaseRequests);
      setVendors(initialVendors);
      setQuotations(initialQuotations);
      setContracts(initialContracts);
      setTransactions(initialTransactions);
      setAuditLogs(initialAuditLogs);
      setSettings(initialAppSettings);
      setSelectedRfqId('rfq-2026-001');
      setRfqRecommendation(null);
      showToast('Reset to demo state locally.', 'success');
    }
  };

  return (
    <ProcureContext.Provider
      value={{
        currentUser,
        switchRole,
        availableUsers: users,
        organisation,
        rfqs,
        purchaseRequests,
        vendors,
        quotations,
        contracts,
        transactions,
        auditLogs,
        settings,
        selectedRfqId,
        setSelectedRfqId,
        selectedRfq,
        toasts,
        showToast,
        removeToast,
        isLoading,
        refreshData,
        resetAllDemoData,
        createPurchaseRequest,
        updatePurchaseRequest,
        createRfq,
        updateRfq,
        deleteRfq,
        createVendor,
        updateVendor,
        createQuotation,
        updateQuotation,
        createContract,
        updateContract,
        updateSettings,
        getEvaluationsForRfq,
        rfqRecommendation,
        setRfqRecommendation,
        hasPermission,
      }}
    >
      {children}
    </ProcureContext.Provider>
  );
};

export const useProcure = () => {
  const context = useContext(ProcureContext);
  if (!context) {
    throw new Error('useProcure must be used within a ProcureProvider');
  }
  return context;
};
