import React, { useState } from 'react';
import { useProcure } from '../../context/ProcureContext';
import { UserRole } from '../../types';
import {
  Bell,
  Search,
  CheckCircle,
  ChevronDown,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  currentTabName: string;
  onOpenNewRfq: () => void;
  onOpenNewPR: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTabName, onOpenNewRfq, onOpenNewPR }) => {
  const {
    currentUser,
    switchRole,
    organisation,
    rfqs,
    selectedRfqId,
    setSelectedRfqId,
    resetAllDemoData,
    hasPermission,
  } = useProcure();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const roles: UserRole[] = [
    'Administrator',
    'Procurement Manager',
    'Procurement Executive',
    'Finance Reviewer',
    'Viewer',
  ];

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white px-6">
        {/* Left: Context Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-slate-900">{organisation.organisationName}</span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span className="font-medium text-slate-600">Procurement</span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span className="font-semibold text-blue-600">{currentTabName}</span>
          </div>

          <div className="hidden h-4 w-px bg-slate-200 sm:block" />

          {/* Active RFQ Quick Selector */}
          <div className="hidden items-center gap-2 lg:flex">
            <span className="text-xs font-medium text-slate-500">Active RFQ:</span>
            <select
              value={selectedRfqId}
              onChange={(e) => setSelectedRfqId(e.target.value)}
              className="rounded-md border border-slate-200 bg-slate-50/80 px-2.5 py-1 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:bg-white focus:outline-none transition-colors"
            >
              {rfqs.map((rfq) => (
                <option key={rfq.rfqId} value={rfq.rfqId}>
                  {rfq.rfqNumber} – {rfq.title.length > 35 ? rfq.title.slice(0, 35) + '...' : rfq.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Actions, Role Selector & User Profile */}
        <div className="flex items-center gap-2.5">
          {/* Reset Demo Data Button */}
          <button
            onClick={() => setIsResetConfirmOpen(true)}
            title="Reset synthetic data to default baseline"
            className="flex items-center gap-1.5 rounded-md border border-slate-200/80 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* Quick Create Buttons */}
          {hasPermission('CREATE_PR') && (
            <button
              onClick={onOpenNewPR}
              className="hidden items-center gap-1 rounded-md border border-slate-200/80 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 sm:flex"
            >
              + Purchase Req
            </button>
          )}

          {hasPermission('CREATE_RFQ') && (
            <button
              onClick={onOpenNewRfq}
              className="flex items-center gap-1 rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-slate-800"
            >
              + New RFQ
            </button>
          )}

          <div className="h-4 w-px bg-slate-200" />

          {/* Interactive User Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 rounded-lg border border-slate-200/80 p-1.5 pr-2.5 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-2xs">
                {currentUser.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="hidden text-left md:block">
                <div className="text-xs font-semibold leading-tight text-slate-900">{currentUser.name}</div>
                <div className="text-[11px] font-medium leading-tight text-blue-600">{currentUser.role}</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-lg z-50">
                <div className="px-2.5 py-2 border-b border-slate-100">
                  <div className="text-xs font-semibold text-slate-900">Switch User Role</div>
                  <div className="text-[11px] text-slate-500">Test role permissions in real-time</div>
                </div>
                <div className="mt-1 space-y-0.5">
                  {roles.map((r) => {
                    const isSelected = currentUser.role === r;
                    return (
                      <button
                        key={r}
                        onClick={() => {
                          switchRole(r);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium text-left transition-colors ${
                          isSelected ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{r}</span>
                        {isSelected && <CheckCircle className="h-3.5 w-3.5 text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Demo Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Reset Demo Environment?</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">
              This will restore all records for <strong>Apex Paper Industries Pvt. Ltd.</strong> (10 vendors, 8 purchase requests, 6 RFQs, 3 verified quotations, contracts, and spend analytics) to the benchmark baseline.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await resetAllDemoData();
                  setIsResetConfirmOpen(false);
                }}
                className="rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-rose-700 transition-colors shadow-2xs"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
