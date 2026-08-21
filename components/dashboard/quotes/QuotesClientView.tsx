'use client';

import { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { QuoteDetailDrawer } from './QuoteDetailDrawer';
import { Button } from '@/components/ui/Button';
import { Eye, FileText, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { deleteQuoteAction } from '@/actions/quote.actions';
import { useToastStore } from '@/lib/store/toast-store';

export function extractCustomerFromQuote(quote: any) {
  if (quote.customers) {
    return {
      companyName: quote.customers.company_name,
      contactName: quote.customers.contact_name || quote.customers.company_name,
      email: quote.customers.contact_email,
      phone: quote.customers.contact_phone,
      type: quote.customers.type || 'RETAIL',
      customNotes: '',
    };
  }

  const notes = quote.notes || '';
  const companyMatch = notes.match(/Company:\s*([^\n]+)/i);
  const contactMatch = notes.match(/Contact:\s*([^\n]+)/i);
  const emailMatch = notes.match(/Email:\s*([^\n]+)/i);
  const phoneMatch = notes.match(/Phone:\s*([^\n]+)/i);
  const reqMatch = notes.match(/Notes:\s*([\s\S]+)/i);

  const company =
    companyMatch && companyMatch[1]?.trim() !== 'N/A'
      ? companyMatch[1]?.trim()
      : '';
  const contact =
    contactMatch && contactMatch[1]?.trim() !== 'N/A'
      ? contactMatch[1]?.trim()
      : '';
  const email =
    emailMatch && emailMatch[1]?.trim() !== 'N/A' ? emailMatch[1]?.trim() : '';
  const phone =
    phoneMatch && phoneMatch[1]?.trim() !== 'N/A' ? phoneMatch[1]?.trim() : '';
  const customNotes = reqMatch ? reqMatch[1]?.trim() : notes;

  return {
    companyName: company || contact || 'Direct Client',
    contactName: contact || company || 'Direct Client',
    email: email || 'No email provided',
    phone: phone || 'No phone provided',
    type: company ? 'WHOLESALE' : 'RETAIL',
    customNotes: customNotes && customNotes !== 'N/A' ? customNotes : '',
  };
}

export function QuotesClientView({ initialQuotes }: { initialQuotes: any[] }) {
  const [quotes, setQuotes] = useState(initialQuotes);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [selectedQuote, setSelectedQuote] = useState<any>(null);
  const [quoteToDelete, setQuoteToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToastStore();

  const filteredQuotes = useMemo(() => {
    if (activeTab === 'ALL') return quotes;
    return quotes.filter((q) => q.status === activeTab);
  }, [quotes, activeTab]);

  const handleDeleteQuote = async () => {
    if (!quoteToDelete) return;
    setIsDeleting(true);
    try {
      const res = await deleteQuoteAction(quoteToDelete.id);
      if (res.success) {
        setQuotes((prev) => prev.filter((q) => q.id !== quoteToDelete.id));
        if (selectedQuote?.id === quoteToDelete.id) {
          setSelectedQuote(null);
        }
        addToast({
          title: 'Quote Deleted',
          description: `Quote #${quoteToDelete.quote_number || quoteToDelete.id.slice(0, 8)} has been deleted.`,
          variant: 'success',
        });
        setQuoteToDelete(null);
      } else {
        throw new Error(res.error || 'Failed to delete quote');
      }
    } catch (err: any) {
      addToast({
        title: 'Delete Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const tabs = [
    { label: 'All Quotes', value: 'ALL', count: quotes.length },
    {
      label: 'Pending',
      value: 'PENDING',
      count: quotes.filter((q) => q.status === 'PENDING').length,
    },
    {
      label: 'Reviewing',
      value: 'REVIEWING',
      count: quotes.filter((q) => q.status === 'REVIEWING').length,
    },
    {
      label: 'Approved',
      value: 'APPROVED',
      count: quotes.filter((q) => q.status === 'APPROVED').length,
    },
    {
      label: 'Fulfilled',
      value: 'FULFILLED',
      count: quotes.filter((q) => q.status === 'FULFILLED').length,
    },
    {
      label: 'Rejected',
      value: 'REJECTED',
      count: quotes.filter((q) => q.status === 'REJECTED').length,
    },
  ];

  const columns = [
    {
      accessorKey: 'id',
      header: 'Quote Ref',
      cell: ({ row }: any) => (
        <Link
          href={`/dashboard/quotes/${row.original.id}`}
          className="font-mono text-xs font-bold text-blue-600 hover:underline"
        >
          #
          {row.original.quote_number ||
            row.original.id.slice(0, 8).toUpperCase()}
        </Link>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }: any) =>
        format(new Date(row.original.created_at), 'MMM d, yyyy'),
    },
    {
      id: 'customer',
      header: 'Customer Company',
      cell: ({ row }: any) => {
        const cust = extractCustomerFromQuote(row.original);
        return (
          <div>
            <div className="font-semibold text-slate-900">
              {cust.companyName}
            </div>
            <div className="text-[11px] text-slate-500">{cust.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'total_amount',
      header: 'Total Value',
      cell: ({ row }: any) => {
        const amount = row.original.total_amount;
        const cust = extractCustomerFromQuote(row.original);
        if ((!amount || amount === 0) && cust.customNotes) {
          return (
            <div>
              <span className="rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
                Custom RFQ
              </span>
            </div>
          );
        }
        return (
          <div className="font-bold text-slate-900">
            KSh {amount?.toLocaleString() || 0}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Status Pipeline',
      cell: ({ row }: any) => {
        const s = row.original.status;
        return (
          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
              s === 'PENDING'
                ? 'border border-amber-200 bg-amber-100 text-amber-900'
                : s === 'APPROVED'
                  ? 'border border-emerald-200 bg-emerald-100 text-emerald-900'
                  : s === 'FULFILLED'
                    ? 'border border-blue-200 bg-blue-100 text-blue-900'
                    : 'bg-slate-100 text-slate-700'
            }`}
          >
            {s}
          </span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }: any) => (
        <div className="flex items-center justify-end gap-1.5 text-right">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedQuote(row.original)}
            className="h-8 gap-1 rounded-lg border-slate-200 px-2.5 text-xs"
          >
            <Eye className="h-3.5 w-3.5" /> Quick View
          </Button>
          <Link href={`/dashboard/quotes/${row.original.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1 rounded-lg px-2 text-xs font-semibold text-blue-600 hover:bg-blue-50"
            >
              Details &rarr;
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuoteToDelete(row.original)}
            className="h-8 w-8 rounded-lg p-0 text-slate-400 hover:bg-red-50 hover:text-red-600"
            title="Delete Quote"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Pipeline Tabs */}
      <div className="custom-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-slate-200/80 pb-1 text-xs font-semibold">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 whitespace-nowrap transition-all ${
              activeTab === tab.value
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`py-0.2 rounded-full px-1.5 text-[10px] font-bold ${
                activeTab === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredQuotes}
        searchKey="id"
        searchPlaceholder="Search by quote reference..."
      />

      {/* Quote Detail Drawer */}
      <QuoteDetailDrawer
        isOpen={!!selectedQuote}
        onClose={() => setSelectedQuote(null)}
        quote={selectedQuote}
        onDelete={() => {
          setQuotes((prev) => prev.filter((q) => q.id !== selectedQuote?.id));
          setSelectedQuote(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        open={!!quoteToDelete}
        onOpenChange={(open) => !open && setQuoteToDelete(null)}
        title="Delete Quotation"
        description={`Are you sure you want to delete quote #${quoteToDelete?.quote_number || quoteToDelete?.id?.slice(0, 8)}? This action cannot be undone.`}
        confirmText="Delete Quote"
        variant="danger"
        onConfirm={handleDeleteQuote}
        isProcessing={isDeleting}
      />
    </div>
  );
}
