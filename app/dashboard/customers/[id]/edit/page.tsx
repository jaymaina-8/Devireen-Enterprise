import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/server';
import { CustomerForm } from '@/components/dashboard/customers/CustomerForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Edit Customer | Devireen Enterprise',
};

async function getCustomer(id: string) {
  const supabase = await createAdminClient();
  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();

  return customer;
}

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const customer = await getCustomer(id);

  if (!customer) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href={`/dashboard/customers/${customer.id}`}>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Customer</h1>
          <p className="text-gray-500">Update customer information.</p>
        </div>
      </div>

      <CustomerForm initialData={customer} />
    </div>
  );
}
