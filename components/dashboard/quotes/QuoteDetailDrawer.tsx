'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  Edit3,
} from 'lucide-react';
import {
  convertQuoteToOrderAction,
  updateQuoteAction,
  deleteQuoteAction,
} from '@/actions/quote.actions';
import { useToastStore } from '@/lib/store/toast-store';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Trash2 } from 'lucide-react';

interface QuoteDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  quote: any;
  onDelete?: () => void;
}

export function QuoteDetailDrawer({
  isOpen,
  onClose,
  quote,
  onDelete,
}: QuoteDetailDrawerProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToastStore();
  const router = useRouter();

  if (!isOpen || !quote) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteQuoteAction(quote.id);
      if (res.success) {
        addToast({
          title: 'Deleted',
          description: 'Quote deleted successfully',
          variant: 'success',
        });
        setDeleteConfirmOpen(false);
        if (onDelete) {
          onDelete();
        } else {
          onClose();
          router.refresh();
        }
      } else {
        throw new Error(res.error || 'Failed to delete quote');
      }
    } catch (err: any) {
      addToast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

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
              <span className="rounded-md bg-slate-800 px-2 py-0.5 font-bold tracking-wider text-slate-200 uppercase">
                {quote.status}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link href={`/dashboard/quotes/${quote.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 border-blue-600 bg-blue-700/60 text-xs font-semibold text-white hover:bg-blue-600"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit / Price Quote
                </Button>
              </Link>

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

              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmOpen(true)}
                className="h-8 w-8 border-slate-700 bg-slate-800 p-0 text-slate-400 hover:border-red-800 hover:bg-red-950 hover:text-red-400"
                title="Delete Quote"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Body Content */}
          <div className="custom-scrollbar flex-1 space-y-6 overflow-y-auto p-6 text-xs">
            {(() => {
              const notes = quote.notes || '';
              const companyMatch = notes.match(/Company:\s*([^\n]+)/i);
              const contactMatch = notes.match(/Contact:\s*([^\n]+)/i);
              const emailMatch = notes.match(/Email:\s*([^\n]+)/i);
              const phoneMatch = notes.match(/Phone:\s*([^\n]+)/i);
              const reqMatch = notes.match(/Notes:\s*([\s\S]+)/i);

              const company =
                quote.customers?.company_name ||
                (companyMatch && companyMatch[1]?.trim() !== 'N/A'
                  ? companyMatch[1]?.trim()
                  : '');
              const contact =
                quote.customers?.contact_name ||
                (contactMatch && contactMatch[1]?.trim() !== 'N/A'
                  ? contactMatch[1]?.trim()
                  : '');
              const email =
                quote.customers?.contact_email ||
                (emailMatch && emailMatch[1]?.trim() !== 'N/A'
                  ? emailMatch[1]?.trim()
                  : '');
              const phone =
                quote.customers?.contact_phone ||
                (phoneMatch && phoneMatch[1]?.trim() !== 'N/A'
                  ? phoneMatch[1]?.trim()
                  : '');
              const customNotes = reqMatch
                ? reqMatch[1]?.trim()
                : !companyMatch
                  ? notes
                  : '';

              return (
                <>
                  {/* Customer Info */}
                  <div className="space-y-2 rounded-xl border border-slate-200/80 bg-slate-50 p-4">
                    <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-900 uppercase">
                      <Building2 className="h-3.5 w-3.5 text-blue-600" />{' '}
                      Customer Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div>
                        <span className="block text-slate-500">
                          Company / Client
                        </span>
                        <span className="text-sm font-semibold text-slate-900">
                          {company || contact || 'Direct Client'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-500">
                          Contact Person
                        </span>
                        <span className="font-semibold text-slate-900">
                          {contact || company || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-500">
                          Contact Email
                        </span>
                        <span className="font-medium text-slate-800">
                          {email || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-500">
                          Phone Number
                        </span>
                        <span className="font-medium text-slate-800">
                          {phone || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="block text-slate-500">
                          Account Type
                        </span>
                        <span className="rounded bg-slate-200/80 px-2 py-0.5 text-[10px] font-semibold text-slate-700 uppercase">
                          {quote.customers?.type ||
                            (company ? 'WHOLESALE' : 'RETAIL')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Custom Inquiries / RFQ notes */}
                  {customNotes && customNotes !== 'N/A' && (
                    <div className="space-y-1.5 rounded-xl border border-blue-200/80 bg-blue-50/60 p-4 text-blue-950">
                      <span className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-blue-800 uppercase">
                        <AlertCircle className="h-3.5 w-3.5 text-blue-600" />
                        Quotation Requirements & Custom Specifications
                      </span>
                      <p className="text-xs font-medium whitespace-pre-wrap">
                        {customNotes}
                      </p>
                    </div>
                  )}

                  {/* Quote Line Items */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold tracking-wider text-slate-900 uppercase">
                      Line Items{' '}
                      {quote.items &&
                        quote.items.length > 0 &&
                        `(${quote.items.length})`}
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
                            quote.items.map((item: any, idx: number) => {
                              const productName =
                                item.products?.name ||
                                item.product_name ||
                                `Product #${item.product_id?.slice(0, 6)}`;
                              const brandName = item.products?.brands?.name;
                              const sku = item.products?.sku;
                              const unit = item.products?.wholesale_unit;

                              return (
                                <tr key={idx} className="hover:bg-slate-50/50">
                                  <td className="p-3">
                                    <div className="font-semibold text-slate-900">
                                      {productName}{' '}
                                      {brandName ? `(${brandName})` : ''}
                                    </div>
                                    <div className="text-[10px] text-slate-400">
                                      {sku ? `SKU: ${sku}` : ''}{' '}
                                      {unit ? `• Unit: ${unit}` : ''}
                                    </div>
                                  </td>
                                  <td className="p-3 text-right font-medium text-slate-700">
                                    {item.quantity}{' '}
                                    {unit ? unit.toLowerCase() : ''}
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
                              );
                            })
                          ) : (
                            <tr>
                              <td
                                colSpan={4}
                                className="p-4 text-center text-slate-400"
                              >
                                {customNotes
                                  ? 'Custom inquiry quotation (see specifications above).'
                                  : 'No catalog items attached.'}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Total Breakdown */}
                  {quote.total_amount > 0 ? (
                    <div className="space-y-2 rounded-xl bg-slate-900 p-4 text-white">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>Subtotal</span>
                        <span>
                          KSh {quote.total_amount?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span>VAT (16% inclusive)</span>
                        <span>
                          KSh {((quote.total_amount || 0) * 0.16).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-800 pt-2 text-sm font-bold text-white">
                        <span>Total Quotation Amount</span>
                        <span className="text-base text-red-400">
                          KSh {quote.total_amount?.toLocaleString() || 0}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-amber-950">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                          <AlertCircle className="h-4 w-4 text-amber-600" />
                          Custom RFQ — Attendant Pricing Pending
                        </div>
                        <Link href={`/dashboard/quotes/${quote.id}`}>
                          <Button
                            size="sm"
                            className="h-7 bg-amber-600 px-3 text-xs font-semibold text-white hover:bg-amber-700"
                          >
                            Price Quote Now &rarr;
                          </Button>
                        </Link>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        This quotation was requested with custom specifications
                        (&quot;{customNotes || 'custom items'}&quot;). Click{' '}
                        <strong>Price Quote Now</strong> to select products and
                        attach official unit pricing.
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Quotation"
        description={`Are you sure you want to delete quote #${quote.quote_number || quote.id.slice(0, 8)}? This action cannot be undone.`}
        confirmText="Delete Quote"
        variant="danger"
        onConfirm={handleDelete}
        isProcessing={isDeleting}
      />
    </div>
  );
}
