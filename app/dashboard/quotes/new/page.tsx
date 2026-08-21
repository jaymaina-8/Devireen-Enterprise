import { createClient } from '@/lib/supabase/server';
import { QuoteForm } from '@/components/dashboard/quotes/QuoteForm';

export const metadata = {
  title: 'Create Quote | Devireen Enterprise',
};

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ customer_id?: string; customerId?: string }>;
}) {
  const params = await searchParams;
  const initialCustomerId = params.customer_id || params.customerId || '';
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
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Create Quote</h1>
        <p className="text-gray-500">
          Manually create a new quote for a customer.
        </p>
      </div>

      <QuoteForm
        customers={customers || []}
        products={products || []}
        defaultCustomerId={initialCustomerId}
      />
    </div>
  );
}
