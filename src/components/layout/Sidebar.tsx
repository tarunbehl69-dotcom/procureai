import React from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  FileText,
  Users,
  UploadCloud,
  GitCompare,
  Sparkles,
  ScrollText,
  PieChart,
  FileBarChart,
  BotMessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useProcure } from '../../context/ProcureContext';

export type NavItemKey =
  | 'dashboard'
  | 'purchase-requests'
  | 'rfqs'
  | 'vendors'
  | 'quotation-analysis'
  | 'vendor-comparison'
  | 'recommendation'
  | 'contracts'
  | 'spend-analytics'
  | 'reports'
  | 'assistant'
  | 'settings';

interface SidebarProps {
  currentNav: NavItemKey;
  onSelectNav: (key: NavItemKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentNav,
  onSelectNav,
  isCollapsed,
  onToggleCollapse,
}) => {
  const { rfqs, purchaseRequests, quotations, contracts } = useProcure();

  // Actionable badges
  const pendingPRs = purchaseRequests.filter(p => p.status === 'Submitted' || p.status === 'Under Review').length;
  const activeRfqs = rfqs.filter(r => ['Sent', 'Responses Received', 'Evaluation in Progress'].includes(r.status)).length;
  const unverifiedQuotes = quotations.filter(q => q.verificationStatus === 'Unverified').length;
  const alertContracts = contracts.filter(c => c.reviewStatus === 'Needs Amendment').length;

  const navItems: Array<{
    key: NavItemKey;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
  }> = [
    { key: 'dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { key: 'purchase-requests', label: 'Purchase Requests', icon: FileSpreadsheet, badge: pendingPRs },
    { key: 'rfqs', label: 'RFQ Management', icon: FileText, badge: activeRfqs },
    { key: 'vendors', label: 'Vendor Directory', icon: Users },
    { key: 'quotation-analysis', label: 'Quotation Analysis', icon: UploadCloud, badge: unverifiedQuotes > 0 ? unverifiedQuotes : undefined, badgeColor: 'bg-amber-900/60 text-amber-300 border border-amber-700/50' },
    { key: 'vendor-comparison', label: 'Vendor Comparison', icon: GitCompare },
    { key: 'recommendation', label: 'AI Recommendation Engine', icon: Sparkles },
    { key: 'contracts', label: 'Contract Intelligence', icon: ScrollText, badge: alertContracts > 0 ? alertContracts : undefined, badgeColor: 'bg-rose-900/60 text-rose-300 border border-rose-700/50' },
    { key: 'spend-analytics', label: 'Spend Analytics', icon: PieChart },
    { key: 'reports', label: 'Procurement Reports', icon: FileBarChart },
    { key: 'assistant', label: 'AI Procurement Assistant', icon: BotMessageSquare },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800/80 bg-[#0B132B] text-slate-300 transition-all duration-200 ease-in-out shrink-0 select-none ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800/80 px-4">
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xs">
              <span className="text-sm font-extrabold tracking-wider">PA</span>
            </div>
            <div className="flex flex-col truncate">
              <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                ProcureAI
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[10px] font-medium text-slate-400 tracking-wide uppercase">Intelligent Copilot</span>
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-xs">
            <span className="text-sm font-extrabold">PA</span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={`flex h-6 w-6 items-center justify-center rounded-md border border-slate-700/80 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${
            isCollapsed ? 'mx-auto' : ''
          }`}
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentNav === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelectNav(item.key)}
              title={isCollapsed ? item.label : undefined}
              className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-slate-800/90 text-white font-semibold shadow-xs border-l-2 border-blue-500'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
              }`}
            >
              <Icon
                className={`h-4 w-4 shrink-0 transition-colors ${
                  isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'
                }`}
              />

              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`ml-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                        item.badgeColor || (isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700')
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Organisation Badge */}
      {!isCollapsed ? (
        <div className="border-t border-slate-800/80 p-3 bg-[#080E21]">
          <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-2.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="truncate">Apex Paper Industries</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400 leading-tight">
              Manufacturing Enterprise · INR (₹)
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-slate-800/80 p-2 text-center text-[10px] text-slate-500 font-mono">
          ₹
        </div>
      )}
    </aside>
  );
};
