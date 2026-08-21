'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { X, Folder, Sparkles } from 'lucide-react';
import {
  createCategoryAction,
  updateCategoryAction,
} from '@/actions/category.actions';
import { useToastStore } from '@/lib/store/toast-store';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: any;
  onSuccess?: () => void;
}

export function CategoryModal({
  isOpen,
  onClose,
  category,
  onSuccess,
}: CategoryModalProps) {
  const [name, setName] = useState(category?.name || '');
  const [slug, setSlug] = useState(category?.slug || '');
  const [description, setDescription] = useState(category?.description || '');
  const [isActive, setIsActive] = useState(category?.is_active ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToastStore();

  useEffect(() => {
    if (category) {
      setName(category.name || '');
      setSlug(category.slug || '');
      setDescription(category.description || '');
      setIsActive(category.is_active ?? true);
    } else {
      setName('');
      setSlug('');
      setDescription('');
      setIsActive(true);
    }
  }, [category, isOpen]);

  useEffect(() => {
    if (!category && name) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      );
    }
  }, [name, category]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('slug', slug);
    formData.append('description', description);
    formData.append('is_active', String(isActive));

    try {
      const res = category
        ? await updateCategoryAction(category.id, formData, true)
        : await createCategoryAction(formData);

      if (res.success) {
        addToast({
          title: category ? 'Category Updated' : 'Category Created',
          description: `Successfully saved ${name}`,
          variant: 'success',
        });
        onClose();
        if (onSuccess) onSuccess();
      } else {
        throw new Error(res.error);
      }
    } catch (err: any) {
      addToast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="animate-in fade-in fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="animate-in fade-in zoom-in-95 relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Folder className="h-4 w-4 text-red-600" />
            {category ? 'Edit Category' : 'Create Category'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="cat_name" className="font-semibold text-slate-700">
              Category Name *
            </Label>
            <Input
              id="cat_name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Electrical & Wiring"
              className="rounded-xl border-slate-200 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat_slug" className="font-semibold text-slate-700">
              Slug *
            </Label>
            <Input
              id="cat_slug"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="electrical-wiring"
              className="rounded-xl border-slate-200 font-mono text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat_desc" className="font-semibold text-slate-700">
              Description
            </Label>
            <Textarea
              id="cat_desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short category description for store browsing..."
              className="rounded-xl border-slate-200 text-xs"
            />
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-2">
            <div>
              <span className="block font-semibold text-slate-900">Status</span>
              <span className="text-[11px] text-slate-500">
                Visible on storefront
              </span>
            </div>
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-red-600 text-xs text-white shadow-sm hover:bg-red-700"
            >
              {isSubmitting
                ? 'Saving...'
                : category
                  ? 'Save Changes'
                  : 'Create Category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
