import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { QuoteForm } from '@/components/dashboard/quotes/QuoteForm';
import { ConvertQuoteToOrderButton } from '@/components/dashboard/quotes/ConvertQuoteToOrderButton';

export const metadata = {
  title: 'Quote Details | Devireen Enterprise',
};

async function getQuoteById(id: string) {
  const supabase = await createClient();
  const { data: quote } = await supabase
    .from('quotes')
    .select('*, customers(*)')
    .eq('id', id)
    .single();

  if (!quote) return null;

  const { data: items } = await supabase
    .from('quote_items')
    .select('*, products(name, sku, price)')
    .eq('quote_id', id);

  return { ...quote, items: items || [] };
}

function getStatusColor(status: string) {
  switch (status) {
    case 'DRAFT':
      return 'default';
    case 'PENDING':
      return 'warning';
    case 'REVIEWING':
      return 'info';
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'error';
    case 'FULFILLED':
      return 'success';
    default:
      return 'default';
  }
}

export default async function QuoteDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quote = await getQuoteById(id);

  if (!quote) {
    notFound();
  }

  const supabase = await createClient();

  // Fetch available customers
  const { data: customers } = await supabase
    .from('customers')
    .select('id, company_name, contact_email')
    .is('deleted_at', null)
    .order('company_name');

  // Fetch available products
  const { data: products } = await supabase
    .from('products')
    .select('id, name, sku, price')
    .is('deleted_at', null)
    .order('name');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/quotes">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Quote #{quote.id.substring(0, 8).toUpperCase()}
            </h1>
            <Badge variant={getStatusColor(quote.status) as any}>
              {quote.status}
            </Badge>
          </div>
          <p className="text-gray-500">
            Requested on{' '}
            {format(new Date(quote.created_at), 'MMMM d, yyyy h:mm a')}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <ConvertQuoteToOrderButton
            quoteId={quote.id}
            currentStatus={quote.status}
          />
          <Button variant="outline" asChild>
            <a
              href={`/api/quote/${quote.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </a>
          </Button>
        </div>
      </div>

      <QuoteForm
        initialData={quote}
        customers={customers || []}
        products={products || []}
      />
    </div>
  );
}
