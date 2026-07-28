import { createClient } from '@/lib/supabase/server';
import { DataTable } from '@/components/ui/DataTable';
import { columns } from '@/components/dashboard/orders/columns';

export const metadata = {
  title: 'Orders | Devireen Enterprise',
};

async function getOrders() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('orders')
    .select(
      '*, customers(company_name, contact_email)'
    )
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function OrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            All customer orders — from public checkout, delivery, and pickup.
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        searchKey="customer"
        searchPlaceholder="Search by customer name..."
      />
    </div>
  );
}
