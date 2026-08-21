'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/Badge';
import { Star, Check } from 'lucide-react';
import { ProductTableRowActions } from './ProductTableRowActions';
import { DataTableColumnHeader } from '@/components/ui/DataTable';

export const columns: ColumnDef<any>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
        checked={table.getIsAllPageRowsSelected()}
        onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
        checked={row.getIsSelected()}
        onChange={(e) => row.toggleSelected(!!e.target.checked)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => {
      const product = row.original;
      const primaryImage =
        product.product_images?.find((img: any) => img.is_primary) ||
        product.product_images?.[0];
      return (
        <div className="flex items-center gap-3 py-0.5">
          <div className="group relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 shadow-2xs">
            {primaryImage ? (
              <img
                src={primaryImage.url}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-110"
              />
            ) : (
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                No Img
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="max-w-[240px] truncate text-xs font-semibold text-slate-900 sm:text-sm">
              {product.name}
            </div>
            <div className="font-mono text-[11px] text-slate-500">
              SKU: {product.sku || 'N/A'}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'category',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      const product = row.original;
      return (
        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
          {Array.isArray(product.categories) && product.categories.length > 0
            ? product.categories.map((c: any) => c.name).join(', ')
            : product.categories?.name || 'Uncategorized'}
        </span>
      );
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Pricing" />
    ),
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-slate-400 uppercase">
              Retail
            </span>
            <span className="text-xs font-bold text-slate-900">
              KSh {product.price?.toLocaleString()}
            </span>
          </div>
          {product.bulk_price != null && (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-emerald-500 uppercase">
                Bulk
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                KSh {product.bulk_price.toLocaleString()}
              </span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status & Badges',
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant={
              product.stock_status === 'IN_STOCK'
                ? 'success'
                : product.stock_status === 'PRE_ORDER'
                  ? 'warning'
                  : 'error'
            }
            className="text-[10px]"
          >
            {product.stock_status.replace('_', ' ')}
          </Badge>
          {!product.is_active && (
            <Badge
              variant="default"
              className="bg-slate-200 text-[10px] text-slate-700"
            >
              Draft
            </Badge>
          )}
          {product.is_featured && (
            <Badge
              variant="default"
              className="border-amber-200 bg-amber-100 text-[10px] text-amber-900"
            >
              <Star className="mr-1 inline h-3 w-3 fill-amber-400 text-amber-500" />
              Featured
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => <ProductTableRowActions product={row.original} />,
  },
];
