'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  X,
  Users,
  Building2,
  Phone,
  Mail,
  FileText,
  ShoppingCart,
  DollarSign,
  Calendar,
  Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';

interface CustomerDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  customer: any;
}

export function CustomerDetailDrawer({
  isOpen,
  onClose,
  customer,
}: CustomerDetailDrawerProps) {
  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="animate-in fade-in fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="animate-in slide-in-from-right flex w-screen max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-50 text-base font-bold text-red-600 shadow-2xs">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {customer.company_name || 'Individual Customer'}
                </h2>
                <span className="font-mono text-xs text-slate-400">
                  Joined {format(new Date(customer.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center justify-between bg-slate-900 px-6 py-3 text-xs text-white">
            <div className="flex items-center gap-4">
              <div>
                <span className="block text-[10px] text-slate-400">
                  KRA PIN
                </span>
                <span className="font-mono font-bold text-red-400">
                  {customer.kra_pin || 'NOT SET'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-slate-400">
                  Account Type
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 uppercase">
                  {customer.type}
                </span>
              </div>
            </div>

            <Link href={`/dashboard/quotes/new?customer_id=${customer.id}`}>
              <Button
                size="sm"
                className="h-8 gap-1.5 bg-red-600 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
              >
                <Plus className="h-3.5 w-3.5" /> Create Quote
              </Button>
            </Link>
          </div>

          {/* Body Content */}
          <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-6 text-xs">
            {/* Contact Card */}
            <div className="space-y-3 rounded-xl border border-slate-200/80 bg-slate-50 p-4">
              <h3 className="text-xs font-bold tracking-wider text-slate-400 text-slate-900 uppercase">
                Contact & Billing Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-slate-500">Contact Email</span>
                  <span className="mt-0.5 flex items-center gap-1.5 font-medium text-slate-900">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />{' '}
                    {customer.contact_email || 'None'}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Phone Number</span>
                  <span className="mt-0.5 flex items-center gap-1.5 font-medium text-slate-900">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />{' '}
                    {customer.contact_phone || 'None'}
                  </span>
                </div>
              </div>
            </div>

            {/* Past Quotes Timeline */}
            <div className="space-y-3">
              <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-400 text-slate-900 uppercase">
                <FileText className="h-3.5 w-3.5 text-red-600" /> Quotation
                History
              </h3>
              <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 text-center text-slate-500">
                Click on any quote from the main Quotes tab to manage line
                items.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
