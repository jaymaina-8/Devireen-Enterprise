'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createCategoryAction,
  updateCategoryAction,
} from '@/actions/category.actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { useToastStore } from '@/lib/store/toast-store';

interface CategoryFormProps {
  initialData?: any;
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');

  // Auto-generate slug from name if creating new category
  useEffect(() => {
    if (!initialData && name) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  }, [name, initialData]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = initialData
        ? await updateCategoryAction(initialData.id, formData)
        : await createCategoryAction(formData);

      if (result.success) {
        addToast({
          title: 'Success',
          description: `Category ${initialData ? 'updated' : 'created'} successfully`,
          variant: 'success',
        });
        router.push('/dashboard/categories');
        router.refresh();
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Failed to save category',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      addToast({
        title: 'Error',
        description: error.message || 'Operation failed',
        variant: 'destructive',
      });
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {initialData ? 'Edit Category' : 'Add Category'}
        </h1>
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Category'}
          </Button>
        </div>
      </div>

      <div className="space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name *</Label>
            <Input
              id="name"
              name="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Office Supplies"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              name="slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="office-supplies"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={initialData?.description}
            placeholder="Describe this category..."
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="display_order">Display Order</Label>
            <Input
              id="display_order"
              name="display_order"
              type="number"
              defaultValue={initialData?.display_order || 0}
            />
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              value="true"
              defaultChecked={initialData ? initialData.is_active : true}
              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <Label htmlFor="is_active" className="ml-2">
              Published (Visible to customers)
            </Label>
          </div>
        </div>
      </div>
    </form>
  );
}
