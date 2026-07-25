'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Edit, Eye, ShieldBan, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useToastStore } from '@/lib/store/toast-store';
import { updateCustomerAction } from '@/actions/customer.actions';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function CustomerTableRowActions({ customer }: { customer: any }) {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);

  const handleToggleStatus = async () => {
    setIsProcessing(true);
    try {
      const result = await updateCustomerAction(customer.id, {
        is_active: !customer.is_active,
      });
      if (result.success) {
        addToast({
          title: result.data.is_active ? 'Unblocked' : 'Blocked',
          description: `Customer is now ${result.data.is_active ? 'Active' : 'Blocked'}`,
          variant: 'success',
        });
        setBlockConfirmOpen(false);
      } else {
        throw new Error(result.error);
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

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${customer.is_active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
          onClick={() =>
            customer.is_active
              ? setBlockConfirmOpen(true)
              : handleToggleStatus()
          }
          disabled={isProcessing}
          title={customer.is_active ? 'Block Customer' : 'Unblock Customer'}
        >
          {customer.is_active ? (
            <ShieldBan className="h-4 w-4" />
          ) : (
            <ShieldCheck className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle Status</span>
        </Button>

        <Link href={`/dashboard/customers/${customer.id}`}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">View</span>
          </Button>
        </Link>

        <Link href={`/dashboard/customers/${customer.id}/edit`}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-blue-200 bg-blue-50/60 px-2.5 text-xs font-semibold text-blue-600 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
            title="Edit customer"
          >
            <Edit className="mr-1 h-3.5 w-3.5" /> Edit
          </Button>
        </Link>
      </div>

      <ConfirmDialog
        open={blockConfirmOpen}
        onOpenChange={setBlockConfirmOpen}
        title="Block Customer"
        description={`Are you sure you want to block ${customer.company_name || customer.contact_email}? They will no longer be able to log in or place orders.`}
        confirmText="Block"
        variant="danger"
        onConfirm={handleToggleStatus}
        isProcessing={isProcessing}
      />
    </>
  );
}
