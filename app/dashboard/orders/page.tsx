import { createClient } from '@/lib/supabase/server';
import { OrdersClientView } from '@/components/dashboard/orders/OrdersClientView';

export const metadata = {
  title: 'Orders | Devireen Enterprise',
};

async function getOrders() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('orders')
    .select('*, customers(company_name, contact_email)')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            All customer orders — from public checkout, delivery, and pickup.
          </p>
        </div>
      </div>

      <OrdersClientView initialOrders={orders} />
    </div>
  );
}
