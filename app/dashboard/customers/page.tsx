import { createClient } from '@/lib/supabase/server';
import { CustomersClientView } from '@/components/dashboard/customers/CustomersClientView';
import { Users, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata = {
  title: 'Customer Directory & CRM | Devireen Enterprise OS',
};

async function getCustomers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('customers')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  return data || [];
}

export default async function CustomersPage() {
  const customers = await getCustomers();

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
            <Users className="h-6 w-6 text-red-600" /> B2B Customer Directory
            (CRM)
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Manage corporate clients, KRA tax profiles, quote histories, and
            contact points.
          </p>
        </div>

        <Link href="/dashboard/customers/new">
          <Button className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-red-700">
            <Plus className="mr-1.5 h-4 w-4" /> Add Customer
          </Button>
        </Link>
      </div>

      <CustomersClientView initialCustomers={customers} />
    </div>
  );
}
