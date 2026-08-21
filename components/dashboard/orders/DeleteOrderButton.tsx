'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { deleteOrderAction } from '@/actions/order.actions';
import { useToastStore } from '@/lib/store/toast-store';

interface DeleteOrderButtonProps {
  orderId: string;
  orderNumber?: string;
  variant?: 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  redirectOnDelete?: boolean;
  className?: string;
}

export function DeleteOrderButton({
  orderId,
  orderNumber,
  variant = 'outline',
  size = 'sm',
  redirectOnDelete = false,
  className,
}: DeleteOrderButtonProps) {
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { addToast } = useToastStore();
  const router = useRouter();

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await deleteOrderAction(orderId);
      if (!res.success) {
        throw new Error(res.error || 'Failed to delete order');
      }

      addToast({
        title: 'Order Deleted',
        description: `Order ${orderNumber || orderId.slice(0, 8)} was removed successfully.`,
        variant: 'success',
      });

      setOpen(false);

      if (redirectOnDelete) {
        router.push('/dashboard/orders');
      } else {
        router.refresh();
      }
    } catch (err: any) {
      addToast({
        title: 'Error',
        description: err.message || 'Something went wrong while deleting order',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Button
        variant={variant as any}
        size={size}
        onClick={() => setOpen(true)}
        className={
          className ||
          'h-8 border-red-200 bg-red-50/60 px-2.5 text-xs font-semibold text-red-600 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white'
        }
        title="Delete order"
      >
        <Trash2 className="h-3.5 w-3.5" />
        {size !== 'icon' && <span className="ml-1">Delete</span>}
      </Button>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Delete Order"
        description={`Are you sure you want to delete order ${orderNumber || orderId.slice(0, 8)}? This will remove the order from the active pipeline.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Order'}
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  );
}
