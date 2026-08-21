'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Folder } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { columns } from './columns';
import { CategoryModal } from './CategoryModal';
import { useRouter } from 'next/navigation';

export function CategoriesClientView({
  initialCategories,
}: {
  initialCategories: any[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const handleSuccess = () => {
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage product taxonomy, category hierarchy, and storefront
            visibility.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-xl bg-red-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {categories && categories.length > 0 ? (
        <DataTable
          columns={columns}
          data={categories}
          searchKey="name"
          searchPlaceholder="Search categories by name..."
        />
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white py-16 text-center shadow-2xs">
          <Folder className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <h3 className="mb-1 text-base font-semibold text-slate-900">
            No categories available
          </h3>
          <p className="mb-6 text-xs text-slate-500">
            Create a category to organize your catalog products.
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-red-600 px-4 text-xs font-semibold text-white shadow-sm hover:bg-red-700"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Create Category
          </Button>
        </div>
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
