'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useToastStore } from '@/lib/store/toast-store';
import {
  deleteCategoryAction,
  updateCategoryAction,
} from '@/actions/category.actions';

export function CategoryTableRowActions({ category }: { category: any }) {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    setIsProcessing(true);
    try {
      const result = await deleteCategoryAction(category.id);
      if (result.success) {
        addToast({
          title: 'Deleted',
          description: 'Category deleted successfully',
          variant: 'success',
        });
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

  const handleTogglePublish = async () => {
    setIsProcessing(true);
    try {
      // Need a way to pass FormData to updateCategoryAction or create a separate update method
      const formData = new FormData();
      formData.set('name', category.name);
      formData.set('slug', category.slug);
      formData.set('description', category.description || '');
      formData.set('is_active', (!category.is_active).toString());
      if (category.parent_id) formData.set('parent_id', category.parent_id);

      // But we will also export a direct data-update action for this
      const result = await updateCategoryAction(category.id, formData, true); // true to skip redirect
      if (result.success) {
        addToast({
          title: !category.is_active ? 'Published' : 'Unpublished',
          description: `Category is now ${!category.is_active ? 'visible' : 'hidden'}`,
          variant: 'success',
        });
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
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={`h-8 w-8 p-0 ${category.is_active ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
        onClick={handleTogglePublish}
        disabled={isProcessing}
        title={category.is_active ? 'Unpublish' : 'Publish'}
      >
        {category.is_active ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4" />
        )}
        <span className="sr-only">Toggle Publish</span>
      </Button>

      <Link href={`/dashboard/categories/${category.id}`}>
        <Button
          variant="outline"
          size="sm"
          className="h-8 border-blue-200 bg-blue-50/60 px-2.5 text-xs font-semibold text-blue-600 transition-colors hover:border-blue-600 hover:bg-blue-600 hover:text-white"
          title="Edit category"
        >
          <Edit className="mr-1 h-3.5 w-3.5" /> Edit
        </Button>
      </Link>

      <Button
        variant="outline"
        size="sm"
        className="h-8 border-red-200 bg-red-50/60 px-2.5 text-xs font-semibold text-red-600 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
        onClick={handleDelete}
        disabled={isProcessing}
        title="Delete category"
      >
        <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
      </Button>
    </div>
  );
}
