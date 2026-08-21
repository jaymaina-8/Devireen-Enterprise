import { createClient } from '@/lib/supabase/server';
import { QuotesClientView } from '@/components/dashboard/quotes/QuotesClientView';
import { FileText, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Quotes Workspace | Devireen Enterprise OS',
};

async function getQuotes() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('quotes')
    .select(
      '*, customers(*), items:quote_items(*, products(name, sku, price, wholesale_price, wholesale_unit, brands(name)))'
    )
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function QuotesPage() {
  const quotes = await getQuotes();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            <FileText className="h-6 w-6 text-blue-600" /> Quotation Workspace
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Review RFQs, generate B2B quotes, track approval pipeline, and
            convert to orders.
          </p>
        </div>

        <Link href="/dashboard/quotes/new">
          <Button className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-blue-500">
            <Plus className="mr-1.5 h-4 w-4" /> Create Quote
          </Button>
        </Link>
      </div>

      <QuotesClientView initialQuotes={quotes} />
    </div>
  );
}
