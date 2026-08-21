'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, Copy, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import {
  deleteProductAction,
  updateProductAction,
  createProductAction,
} from '@/actions/product.actions';
import { useToastStore } from '@/lib/store/toast-store';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export function ProductTableRowActions({ product }: { product: any }) {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      const result = await deleteProductAction(product.id);
      if (result.success) {
        addToast({
          title: 'Deleted',
          description: 'Product deleted successfully',
          variant: 'success',
        });
        setDeleteConfirmOpen(false);
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

  const handleDuplicate = async () => {
    setIsProcessing(true);
    try {
      // Remove id, dates, and modify slug/sku slightly to avoid uniqueness constraint errors
      const duplicateData = {
        name: `${product.name} (Copy)`,
        slug: `${product.slug}-copy-${Math.floor(Math.random() * 1000)}`,
        sku: `${product.sku}-COPY`,
        description: product.description,
        category_id: product.category_id,
        brand_id: product.brand_id,
        price: product.price,
        sale_price: product.sale_price,
        stock_status: product.stock_status,
        is_active: false, // Set to draft by default
        is_featured: false,
        attributes: product.attributes,
        seo_title: product.seo_title,
        seo_description: product.seo_description,
      };

      const result = await createProductAction(duplicateData);
      if (result.success) {
        addToast({
          title: 'Duplicated',
          description: 'Product duplicated as draft',
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
      const result = await updateProductAction(product.id, {
        is_active: !product.is_active,
      });
      if (result.success) {
        addToast({
          title: result.data.is_active ? 'Published' : 'Unpublished',
          description: `Product is now ${result.data.is_active ? 'visible' : 'hidden'}`,
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
    <>
      <div className="flex items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 ${product.is_active ? 'text-green-600 hover:text-green-700' : 'text-gray-400 hover:text-gray-600'}`}
          onClick={handleTogglePublish}
          disabled={isProcessing}
          title={product.is_active ? 'Unpublish' : 'Publish'}
        >
          {product.is_active ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle Publish</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-slate-600 hover:text-slate-900"
          onClick={handleDuplicate}
          disabled={isProcessing}
          title="Duplicate"
        >
          <Copy className="h-4 w-4" />
          <span className="sr-only">Duplicate</span>
        </Button>

        <Link href={`/dashboard/products/${product.id}`}>
          <Button
            variant="outline"
            size="sm"
            className="h-8 border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900"
            title="Edit product"
          >
            <Edit className="mr-1 h-3.5 w-3.5" /> Edit
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          className="h-8 border-red-200 bg-red-50/60 px-2.5 text-xs font-semibold text-red-600 transition-colors hover:border-red-600 hover:bg-red-600 hover:text-white"
          onClick={() => setDeleteConfirmOpen(true)}
          disabled={isProcessing}
          title="Delete product"
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
        </Button>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Product"
        description={`Are you sure you want to delete ${product.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        isProcessing={isProcessing}
      />
    </>
  );
}
