'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import Link from 'next/link';
import { DataTableColumnHeader } from '@/components/ui/DataTable';
import { Truck, Store, Download } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { updateOrderStatusAction, updateOrderPaymentStatusAction } from '@/actions/order.actions';
import { useToastStore } from '@/lib/store/toast-store';
import { useState } from 'react';

const StatusCell = ({ order }: { order: any }) => {
  const [status, setStatus] = useState(order.status);
  const { addToast } = useToastStore();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    const res = await updateOrderStatusAction(order.id, newStatus);
    if (!res.success) {
      setStatus(order.status); // revert
      addToast({ title: 'Error', description: res.error || 'Failed to update status', variant: 'destructive' });
    } else {
      addToast({ title: 'Updated', description: 'Order status updated', variant: 'success' });
    }
  };

  return (
    <Select value={status} onChange={handleStatusChange} className="w-[120px] text-xs h-8">
      <option value="PENDING">PENDING</option>
      <option value="PROCESSING">PROCESSING</option>
      <option value="SHIPPED">SHIPPED</option>
      <option value="DELIVERED">DELIVERED</option>
      <option value="CANCELLED">CANCELLED</option>
      <option value="REFUNDED">REFUNDED</option>
    </Select>
  );
};

const PaymentStatusCell = ({ order }: { order: any }) => {
  const [status, setStatus] = useState(order.payment_status);
  const { addToast } = useToastStore();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    const res = await updateOrderPaymentStatusAction(order.id, newStatus);
    if (!res.success) {
      setStatus(order.payment_status); // revert
      addToast({ title: 'Error', description: res.error || 'Failed to update payment status', variant: 'destructive' });
    } else {
      addToast({ title: 'Updated', description: 'Payment status updated', variant: 'success' });
    }
  };

  return (
    <Select value={status} onChange={handleStatusChange} className="w-[110px] text-xs h-8">
      <option value="UNPAID">UNPAID</option>
      <option value="PARTIAL">PARTIAL</option>
      <option value="PAID">PAID</option>
      <option value="REFUNDED">REFUNDED</option>
    </Select>
  );
};

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Order" />,
    cell: ({ row }) => {
      const orderId = row.original.id;
      return (
        <Link
          href={`/dashboard/orders/${orderId}`}
          className="font-mono text-xs text-blue-600 hover:underline"
        >
          {row.original.invoice_number || orderId.substring(0, 8).toUpperCase()}
        </Link>
      );
    },
  },
  {
    id: 'customer',
    accessorFn: (row) => row.customer_name || row.customers?.company_name || 'Guest',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Customer" />,
    cell: ({ row }) => {
      const order = row.original;
      // Guest orders: use customer_name. Linked orders: use customers table
      const name = order.customer_name || order.customers?.company_name || 'Guest';
      const email = order.customer_email || order.customers?.contact_email || '';
      return (
        <div>
          <div className="font-medium text-gray-900 text-sm">{name}</div>
          {email && <div className="text-xs text-gray-500">{email}</div>}
        </div>
      );
    },
  },
  {
    id: 'fulfillment',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Fulfillment" />,
    cell: ({ row }) => {
      const type = row.original.fulfillment_type;
      if (!type) return <span className="text-xs text-gray-400">—</span>;
      return (
        <div className="flex items-center gap-1.5">
          {type === 'DELIVERY' ? (
            <Truck className="h-3.5 w-3.5 text-blue-500" />
          ) : (
            <Store className="h-3.5 w-3.5 text-amber-500" />
          )}
          <span className="text-xs font-medium capitalize">
            {type === 'DELIVERY' ? 'Delivery' : 'Pickup'}
          </span>
        </div>
      );
    },
  },
  {
    id: 'pricing',
    header: 'Pricing',
    cell: ({ row }) => {
      const model = row.original.pricing_model;
      if (!model) return null;
      return (
        <Badge
          variant={model === 'BULK' ? 'success' : 'default'}
          className="text-[10px]"
        >
          {model}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      return <StatusCell order={row.original} />;
    },
  },
  {
    accessorKey: 'payment_status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Payment" />,
    cell: ({ row }) => {
      return <PaymentStatusCell order={row.original} />;
    },
  },
  {
    accessorKey: 'total_amount',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Total" />,
    cell: ({ row }) => {
      const amount = row.original.total_amount;
      return (
        <div className="font-medium text-gray-900">KSh {amount?.toLocaleString() || '0'}</div>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Date" />,
    cell: ({ row }) => {
      return (
        <span className="text-sm text-gray-600">
          {format(new Date(row.original.created_at), 'MMM d, yyyy')}
        </span>
      );
    },
  },
  {
    id: 'invoice',
    header: 'Invoice',
    cell: ({ row }) => {
      const order = row.original;
      if (!order.invoice_number) return <span className="text-xs text-gray-400">—</span>;
      return (
        <a
          href={`/api/invoice/${order.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
          title="Download Invoice PDF"
        >
          <Download className="h-3 w-3" />
          PDF
        </a>
      );
    },
  },
];
