'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  X,
  FileText,
  Printer,
  ArrowRight,
  CheckCircle2,
  Building2,
  User,
  Clock,
  AlertCircle,
  ShoppingCart,
} from 'lucide-react';
import {
  convertQuoteToOrderAction,
  updateQuoteAction,
} from '@/actions/quote.actions';
import { useToastStore } from '@/lib/store/toast-store';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

interface QuoteDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quote: any;
}

export function QuoteDetailDrawer({
  isOpen,
  onClose,
  quote,
}: QuoteDetailDrawerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { addToast } = useToastStore();
  const router = useRouter();

  if (!isOpen || !quote) return null;

  const handleConvert = async () => {
    setIsProcessing(true);
    try {
      const res = await convertQuoteToOrderAction(quote.id);
      if (res.success) {
        addToast({
          title: 'Converted!',
          description: 'Quote converted to Order successfully',
          variant: 'success',
        });
        onClose();
        router.push('/dashboard/orders');
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      addToast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    window.location.href = `/api/quote/${quote.id}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="animate-in fade-in fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="animate-in slide-in-from-right flex w-screen max-w-2xl flex-col border-l border-slate-200 bg-white shadow-2xl duration-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-blue-600">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Quote #{quote.quote_number || quote.id.slice(0, 8)}
                </h2>
                <span className="font-mono text-xs text-slate-400">
                  Created{' '}
                  {format(new Date(quote.created_at), 'MMM d, yyyy • h:mm a')}
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

          {/* Action Bar */}
          <div className="flex items-center justify-between bg-slate-900 px-6 py-3 text-xs text-white">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Current Status:</span>
              <span className="rounded-md bg-blue-500/20 px-2 py-0.5 font-bold tracking-wider text-blue-400 uppercase">
                {quote.status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="h-8 gap-1.5 border-slate-700 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700"
              >
                <Printer className="h-3.5 w-3.5" /> Download PDF
              </Button>

              {quote.status !== 'FULFILLED' && (
                <Button
                  size="sm"
                  onClick={handleConvert}
                  disabled={isProcessing}
                  className="h-8 gap-1.5 bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-500"
                >
                  <ShoppingCart className="h-3.5 w-3.5" /> Convert to Order
                </Button>
              )}
            </div>
          </div>

          {/* Body Content */}
          <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-6 text-xs">
            {/* Customer Info */}
            <div className="space-y-2 rounded-xl border border-slate-200/80 bg-slate-50 p-4">
              <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-400 text-slate-900 uppercase">
                <Building2 className="h-3.5 w-3.5 text-blue-600" /> Customer
                Information
              </h3>
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <span className="block text-slate-500">Company / Client</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {quote.customers?.company_name || 'Individual Customer'}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Contact Email</span>
                  <span className="font-medium text-slate-800">
                    {quote.customers?.contact_email || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Phone Number</span>
                  <span className="font-medium text-slate-800">
                    {quote.customers?.contact_phone || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="block text-slate-500">Account Type</span>
                  <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600 uppercase">
                    {quote.customers?.type || 'RETAIL'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quote Line Items */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold tracking-wider text-slate-400 text-slate-900 uppercase">
                Line Items
              </h3>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-left">
                  <thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase">
                    <tr>
                      <th className="p-3">Item / Product</th>
                      <th className="p-3 text-right">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {quote.items && quote.items.length > 0 ? (
                      quote.items.map((item: any, idx: number) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="p-3 font-semibold text-slate-900">
                            {item.product_name ||
                              `Product #${item.product_id?.slice(0, 6)}`}
                          </td>
                          <td className="p-3 text-right text-slate-600">
                            {item.quantity}
                          </td>
                          <td className="p-3 text-right text-slate-600">
                            KSh {item.unit_price?.toLocaleString()}
                          </td>
                          <td className="p-3 text-right font-bold text-slate-900">
                            KSh{' '}
                            {(
                              item.quantity * item.unit_price
                            )?.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="p-4 text-center text-slate-400"
                        >
                          No items attached.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Breakdown */}
            <div className="space-y-2 rounded-xl bg-slate-900 p-4 text-white">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Subtotal</span>
                <span>KSh {quote.total_amount?.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>VAT (16% inclusive)</span>
                <span>KSh {((quote.total_amount || 0) * 0.16).toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-sm font-bold text-white">
                <span>Total Quotation Amount</span>
                <span className="text-base text-blue-400">
                  KSh {quote.total_amount?.toLocaleString() || 0}
                </span>
              </div>
            </div>

            {/* Internal Notes */}
            {quote.notes && (
              <div className="space-y-1.5 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3 text-amber-900">
                <span className="block text-[10px] font-bold tracking-wider uppercase">
                  Internal Operational Notes
                </span>
                <p className="text-xs italic">{quote.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
