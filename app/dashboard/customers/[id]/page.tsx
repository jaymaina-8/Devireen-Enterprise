import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ArrowLeft,
  Mail,
  Phone,
  FileText,
  ShoppingBag,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Customer Details | Devireen Enterprise',
};

async function getCustomerData(id: string) {
  const supabase = await createAdminClient();

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  if (!customer) return null;

  const { data: quotes } = await supabase
    .from('quotes')
    .select('id, status, total_amount, created_at')
    .eq('customer_id', id)
    .order('created_at', { ascending: false });

  const { data: orders } = await supabase
    .from('orders')
    .select('id, status, total_amount, created_at')
    .eq('customer_id', id)
    .order('created_at', { ascending: false });

  return { customer, quotes: quotes || [], orders: orders || [] };
}

export default async function CustomerDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getCustomerData(id);

  if (!data) {
    notFound();
  }

  const { customer, quotes, orders } = data;

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/customers">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              {customer.company_name || 'Individual Customer'}
            </h1>
            {customer.is_active !== false ? (
              <Badge variant="success">Active</Badge>
            ) : (
              <Badge variant="error">Blocked</Badge>
            )}
            <Badge variant={customer.type === 'BUSINESS' ? 'info' : 'default'}>
              {customer.type}
            </Badge>
          </div>
          <p className="text-gray-500">
            Customer since{' '}
            {format(new Date(customer.created_at), 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Link href={`/dashboard/customers/${customer.id}/edit`}>
            <Button variant="outline">Edit Customer</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 border-b pb-3 text-lg font-semibold text-gray-900">
              Contact Info
            </h2>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">Email Address</div>
                  <div className="text-gray-600">
                    {customer.contact_email || 'Not provided'}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <div className="font-medium text-gray-900">Phone Number</div>
                  <div className="text-gray-600">
                    {customer.contact_phone || 'Not provided'}
                  </div>
                </div>
              </div>
              {customer.kra_pin && (
                <div className="flex items-start gap-3">
                  <FileText className="mt-0.5 h-5 w-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">KRA PIN</div>
                    <div className="text-gray-600">{customer.kra_pin}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 border-b pb-3 text-lg font-semibold text-gray-900">
              Customer Summary
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {quotes.length}
                </div>
                <div className="mt-1 text-xs tracking-wider text-gray-500 uppercase">
                  Quotes
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {orders.length}
                </div>
                <div className="mt-1 text-xs tracking-wider text-gray-500 uppercase">
                  Orders
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <ShoppingBag className="h-5 w-5 text-blue-600" /> Recent Orders
              </h2>
            </div>
            {orders.length > 0 ? (
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3 font-medium">Order ID</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.slice(0, 5).map((order: any) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 font-mono text-xs">
                        {order.id.substring(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge>{order.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        KSh {order.total_amount?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-sm text-gray-500">
                No orders found for this customer.
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                <FileText className="h-5 w-5 text-indigo-600" /> Recent Quotes
              </h2>
            </div>
            {quotes.length > 0 ? (
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                  <tr>
                    <th className="px-6 py-3 font-medium">Quote ID</th>
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {quotes.slice(0, 5).map((quote: any) => (
                    <tr key={quote.id}>
                      <td className="px-6 py-4 font-mono text-xs">
                        <Link
                          href={`/dashboard/quotes/${quote.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {quote.id.substring(0, 8).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        {format(new Date(quote.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4">
                        <Badge>{quote.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-right font-medium">
                        KSh {quote.total_amount?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-6 text-center text-sm text-gray-500">
                No quotes found for this customer.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
