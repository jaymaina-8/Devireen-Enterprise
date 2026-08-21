'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/Button';
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';
import { deleteCategoryAction } from '@/actions/category.actions';
import { useToastStore } from '@/lib/store/toast-store';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Category Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div>
        <div className="font-medium text-gray-900">{row.getValue('name')}</div>
        <div className="text-xs text-gray-500">/{row.original.slug}</div>
      </div>
    ),
  },
  {
    accessorKey: 'description',
    header: 'Description',
    cell: ({ row }) => {
      const desc = row.getValue('description') as string;
      return (
        <div className="max-w-xs truncate text-gray-500">{desc || '-'}</div>
      );
    },
  },
  {
    accessorKey: 'productCount',
    header: 'Products',
    cell: ({ row }) => {
      const count = row.getValue('productCount') as number;
      return (
        <div className="inline-flex items-center justify-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
          {count}
        </div>
      );
    },
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('is_active') as boolean;
      return (
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
            isActive
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-600'
          }`}
        >
          {isActive ? 'Published' : 'Draft'}
        </span>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Created Date',
    cell: ({ row }) => {
      return (
        <div className="text-gray-500">
          {format(new Date(row.getValue('created_at')), 'MMM d, yyyy')}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: function Cell({ row }) {
      const category = row.original;
      const [isDeleting, setIsDeleting] = useState(false);
      const [confirmOpen, setConfirmOpen] = useState(false);
      const { addToast } = useToastStore();

      const handleDelete = async () => {
        setIsDeleting(true);
        try {
          const result = await deleteCategoryAction(category.id);
          if (result.success) {
            addToast({
              title: 'Success',
              description: 'Category deleted successfully',
              variant: 'success',
            });
            setConfirmOpen(false);
          } else {
            addToast({
              title: 'Cannot Delete',
              description: result.error || 'Failed to delete category',
              variant: 'destructive',
            });
          }
        } catch (error: any) {
          addToast({
            title: 'Error',
            description: error.message || 'Operation failed',
            variant: 'destructive',
          });
        } finally {
          setIsDeleting(false);
        }
      };

      return (
        <div className="flex items-center justify-end gap-2">
          <Link href={`/dashboard/categories/${category.id}/edit`}>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <span className="sr-only">Edit</span>
              <Edit className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => setConfirmOpen(true)}
          >
            <span className="sr-only">Delete</span>
            <Trash2 className="h-4 w-4" />
          </Button>

          <ConfirmDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            title="Delete Category"
            description={`Are you sure you want to delete "${category.name}"? This action cannot be undone.`}
            confirmText="Delete"
            variant="danger"
            onConfirm={handleDelete}
            isProcessing={isDeleting}
          />
        </div>
      );
    },
  },
];
