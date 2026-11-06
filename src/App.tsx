import React, { useState } from 'react';
import { ProcureProvider, useProcure } from './context/ProcureContext';
import { Sidebar, NavItemKey } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { DashboardView } from './views/DashboardView';
import { PurchaseRequestsView } from './views/PurchaseRequestsView';
import { RfqManagementView } from './views/RfqManagementView';
import { VendorDirectoryView } from './views/VendorDirectoryView';
import { QuotationAnalysisView } from './views/QuotationAnalysisView';
import { VendorComparisonView } from './views/VendorComparisonView';
import { AiRecommendationView } from './views/AiRecommendationView';
import { ContractIntelligenceView } from './views/ContractIntelligenceView';
import { SpendAnalyticsView } from './views/SpendAnalyticsView';
import { ProcurementReportsView } from './views/ProcurementReportsView';
import { AiAssistantView } from './views/AiAssistantView';
import { SettingsView } from './views/SettingsView';
import { PurchaseRequest } from './types';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [currentNav, setCurrentNav] = useState<NavItemKey>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isRfqCreateModalOpen, setIsRfqCreateModalOpen] = useState(false);

  const { toasts, removeToast } = useProcure();

  const navTitles: Record<NavItemKey, string> = {
    'dashboard': 'Overview Dashboard',
    'purchase-requests': 'Purchase Requests',
    'rfqs': 'RFQ Management',
    'vendors': 'Vendor Directory',
    'quotation-analysis': 'Quotation Analysis',
    'vendor-comparison': 'Vendor Comparison',
    'recommendation': 'AI Recommendation Engine',
    'contracts': 'Contract Intelligence',
    'spend-analytics': 'Spend Analytics',
    'reports': 'Procurement Reports',
    'assistant': 'AI Procurement Assistant',
    'settings': 'Settings',
  };

  const handleConvertToRfq = (pr: PurchaseRequest) => {
    setCurrentNav('rfqs');
    setIsRfqCreateModalOpen(true);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F7FB]">
      {/* Collapsible Left Sidebar */}
      <Sidebar
        currentNav={currentNav}
        onSelectNav={setCurrentNav}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Header
          currentTabName={navTitles[currentNav]}
          onOpenNewRfq={() => {
            setCurrentNav('rfqs');
            setIsRfqCreateModalOpen(true);
          }}
          onOpenNewPR={() => {
            setCurrentNav('purchase-requests');
          }}
        />

        {/* View Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {currentNav === 'dashboard' && <DashboardView onNavigate={setCurrentNav} />}
            {currentNav === 'purchase-requests' && (
              <PurchaseRequestsView onConvertToRfq={handleConvertToRfq} />
            )}
            {currentNav === 'rfqs' && (
              <RfqManagementView
                onNavigate={setCurrentNav}
                isCreateModalOpen={isRfqCreateModalOpen}
                setIsCreateModalOpen={setIsRfqCreateModalOpen}
              />
            )}
            {currentNav === 'vendors' && <VendorDirectoryView />}
            {currentNav === 'quotation-analysis' && (
              <QuotationAnalysisView onNavigate={setCurrentNav} />
            )}
            {currentNav === 'vendor-comparison' && (
              <VendorComparisonView onNavigate={setCurrentNav} />
            )}
            {currentNav === 'recommendation' && (
              <AiRecommendationView onNavigate={setCurrentNav} />
            )}
            {currentNav === 'contracts' && <ContractIntelligenceView />}
            {currentNav === 'spend-analytics' && <SpendAnalyticsView />}
            {currentNav === 'reports' && <ProcurementReportsView />}
            {currentNav === 'assistant' && <AiAssistantView />}
            {currentNav === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Global Toast Notifications Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => {
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 shadow-lg text-xs font-medium transition-all ${
                toast.type === 'success'
                  ? 'bg-white border-emerald-300 text-slate-800'
                  : toast.type === 'error'
                  ? 'bg-white border-rose-300 text-slate-800'
                  : toast.type === 'warning'
                  ? 'bg-white border-amber-300 text-slate-800'
                  : 'bg-white border-blue-300 text-slate-800'
              }`}
            >
              {toast.type === 'success' && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
              {toast.type === 'error' && <XCircle className="h-4 w-4 text-rose-600 shrink-0" />}
              {toast.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />}
              {toast.type === 'info' && <Info className="h-4 w-4 text-blue-600 shrink-0" />}

              <span>{toast.message}</span>

              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ProcureProvider>
      <MainLayout />
    </ProcureProvider>
  );
}
