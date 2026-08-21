'use client';

import { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { columns } from './columns';
import { Button } from '@/components/ui/Button';
import { Download, Filter, ShoppingCart } from 'lucide-react';
import { useToastStore } from '@/lib/store/toast-store';

export function OrdersClientView({ initialOrders }: { initialOrders: any[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [fulfillmentFilter, setFulfillmentFilter] = useState<string>('ALL');
  const { addToast } = useToastStore();

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab status filtering
      if (activeTab === 'ACTIVE') {
        const activeStatuses = [
          'PENDING',
          'CONFIRMED',
          'PROCESSING',
          'SHIPPED',
        ];
        if (!activeStatuses.includes(order.status)) return false;
      } else if (activeTab === 'DELIVERED') {
        if (order.status !== 'DELIVERED') return false;
      } else if (activeTab === 'CANCELLED') {
        if (order.status !== 'CANCELLED' && order.status !== 'REFUNDED')
          return false;
      }

      // Fulfillment filtering
      if (fulfillmentFilter !== 'ALL') {
        if (order.fulfillment_type !== fulfillmentFilter) return false;
      }

      return true;
    });
  }, [orders, activeTab, fulfillmentFilter]);

  const activeCount = orders.filter((o) =>
    ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED'].includes(o.status)
  ).length;
  const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
  const cancelledCount = orders.filter(
    (o) => o.status === 'CANCELLED' || o.status === 'REFUNDED'
  ).length;

  const tabs = [
    { label: 'All Orders', value: 'ALL', count: orders.length },
    { label: 'Active Pipeline', value: 'ACTIVE', count: activeCount },
    { label: 'Delivered', value: 'DELIVERED', count: deliveredCount },
    {
      label: 'Cancelled / Refunded',
      value: 'CANCELLED',
      count: cancelledCount,
    },
  ];

  // CSV Export handler
  const handleExportCSV = () => {
    if (filteredOrders.length === 0) return;
    const headers = [
      'Order ID',
      'Invoice Number',
      'Customer',
      'Email',
      'Fulfillment',
      'Pricing Model',
      'Status',
      'Payment Status',
      'Total Amount',
      'Date',
    ];
    const rows = filteredOrders.map((o) => [
      o.id,
      o.invoice_number || '',
      `"${(o.customer_name || o.customers?.company_name || 'Guest').replace(/"/g, '""')}"`,
      o.customer_email || o.customers?.contact_email || '',
      o.fulfillment_type || '',
      o.pricing_model || 'RETAIL',
      o.status,
      o.payment_status,
      o.total_amount || 0,
      new Date(o.created_at).toISOString().slice(0, 10),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `devireen_orders_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      title: 'Export Complete',
      description: `Exported ${filteredOrders.length} orders to CSV`,
      variant: 'success',
    });
  };

  return (
    <div className="space-y-4">
      {/* Status Pipeline Tabs */}
      <div className="custom-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-slate-200/80 pb-1 text-xs font-semibold">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 whitespace-nowrap transition-all ${
              activeTab === tab.value
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`py-0.2 rounded-full px-1.5 text-[10px] font-bold ${
                activeTab === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Filter & Export Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 text-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-slate-700 uppercase">
            <Filter className="h-3.5 w-3.5 text-blue-600" /> Fulfillment:
          </div>

          <select
            value={fulfillmentFilter}
            onChange={(e) => setFulfillmentFilter(e.target.value)}
            className="h-8 rounded-xl border-slate-200 bg-slate-50 px-2.5 text-xs font-medium"
          >
            <option value="ALL">All Fulfillment Types</option>
            <option value="DELIVERY">Delivery</option>
            <option value="PICKUP">Pickup</option>
          </select>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="flex h-8 items-center gap-1.5 rounded-xl border-slate-200 text-xs"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" /> Export CSV
        </Button>
      </div>

      {/* Main DataTable */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        searchKey="customer"
        searchPlaceholder="Search orders by customer name..."
      />
    </div>
  );
}
