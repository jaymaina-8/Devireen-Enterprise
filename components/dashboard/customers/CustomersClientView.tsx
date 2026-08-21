'use client';

import { useState, useMemo } from 'react';
import { DataTable } from '@/components/ui/DataTable';
import { CustomerDetailDrawer } from './CustomerDetailDrawer';
import { Button } from '@/components/ui/Button';
import { Eye, Mail, Phone, Building2, Download, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useToastStore } from '@/lib/store/toast-store';

export function CustomersClientView({
  initialCustomers,
}: {
  initialCustomers: any[];
}) {
  const [customers] = useState(initialCustomers);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const { addToast } = useToastStore();

  const filteredCustomers = useMemo(() => {
    if (activeTab === 'ALL') return customers;
    return customers.filter(
      (c) => (c.type || 'RETAIL').toUpperCase() === activeTab
    );
  }, [customers, activeTab]);

  const corporateCount = customers.filter(
    (c) => (c.type || '').toUpperCase() === 'CORPORATE'
  ).length;
  const wholesaleCount = customers.filter(
    (c) => (c.type || '').toUpperCase() === 'WHOLESALE'
  ).length;
  const retailCount = customers.filter(
    (c) => (c.type || 'RETAIL').toUpperCase() === 'RETAIL'
  ).length;

  const tabs = [
    { label: 'All Accounts', value: 'ALL', count: customers.length },
    { label: 'Corporate / B2B', value: 'CORPORATE', count: corporateCount },
    { label: 'Wholesale', value: 'WHOLESALE', count: wholesaleCount },
    { label: 'Retail', value: 'RETAIL', count: retailCount },
  ];

  // CSV Export handler
  const handleExportCSV = () => {
    if (filteredCustomers.length === 0) return;
    const headers = [
      'Customer ID',
      'Company Name',
      'Contact Email',
      'Contact Phone',
      'Account Type',
      'KRA PIN',
      'Joined Date',
    ];
    const rows = filteredCustomers.map((c) => [
      c.id,
      `"${(c.company_name || 'Individual Customer').replace(/"/g, '""')}"`,
      c.contact_email || '',
      c.contact_phone || '',
      c.type || 'RETAIL',
      c.kra_pin || '',
      new Date(c.created_at).toISOString().slice(0, 10),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `devireen_customers_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast({
      title: 'Export Complete',
      description: `Exported ${filteredCustomers.length} customer records to CSV`,
      variant: 'success',
    });
  };

  const columns = [
    {
      accessorKey: 'company_name',
      header: 'Company / Client',
      cell: ({ row }: any) => (
        <button
          onClick={() => setSelectedCustomer(row.original)}
          className="text-left font-bold text-slate-900 transition-colors hover:text-red-600"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 shrink-0 text-slate-700" />
            <span>{row.original.company_name || 'Individual Customer'}</span>
          </div>
          {row.original.kra_pin && (
            <div className="pl-6 font-mono text-[10px] text-slate-400">
              KRA: {row.original.kra_pin}
            </div>
          )}
        </button>
      ),
    },
    {
      accessorKey: 'contact_email',
      header: 'Contact Info',
      cell: ({ row }: any) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700">
            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>{row.original.contact_email || 'No email'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span>{row.original.contact_phone || 'No phone'}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Account Type',
      cell: ({ row }: any) => {
        const type = (row.original.type || 'RETAIL').toUpperCase();
        return (
          <span
            className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
              type === 'CORPORATE'
                ? 'border border-blue-200 bg-blue-50 text-blue-800'
                : type === 'WHOLESALE'
                  ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border border-slate-200 bg-slate-100 text-slate-700'
            }`}
          >
            {type}
          </span>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Joined Date',
      cell: ({ row }: any) =>
        format(new Date(row.original.created_at), 'MMM d, yyyy'),
    },
    {
      id: 'actions',
      cell: ({ row }: any) => (
        <div className="text-right">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedCustomer(row.original)}
            className="h-8 gap-1 rounded-lg border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:border-slate-300 hover:bg-slate-50"
          >
            <Eye className="h-3.5 w-3.5" /> Inspect CRM
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Account Type Filter Tabs */}
      <div className="custom-scrollbar flex items-center justify-between gap-1.5 overflow-x-auto border-b border-slate-200/80 pb-1 text-xs font-semibold">
        <div className="flex items-center gap-1.5">
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
                    ? 'bg-red-600 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
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
        data={filteredCustomers}
        searchKey="company_name"
        searchPlaceholder="Search customers by company or name..."
      />

      {/* Customer CRM Drawer */}
      <CustomerDetailDrawer
        isOpen={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        customer={selectedCustomer}
      />
    </div>
  );
}
