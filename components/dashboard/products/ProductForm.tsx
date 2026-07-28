'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createProductAction, updateProductAction, addProductImageRecord } from '@/actions/product.actions';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { useToastStore } from '@/lib/store/toast-store';
import { ProductImageManager } from './ProductImageManager';
import Image from 'next/image';

interface ProductFormProps {
  initialData?: any;
  categories: any[];
  brands: any[];
}

export function ProductForm({ initialData, categories, brands }: ProductFormProps) {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [salePrice, setSalePrice] = useState(initialData?.sale_price || '');
  const [bulkPrice, setBulkPrice] = useState(initialData?.bulk_price || '');
  const [bulkUnit, setBulkUnit] = useState(initialData?.bulk_unit || 'Dozen');
  const [categoryId, setCategoryId] = useState(initialData?.category_id || '');
  const [pendingImages, setPendingImages] = useState<File[]>([]);
  const supabase = createClient();

  // Auto-generate slug from name if creating new product
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
    const data = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      sku: formData.get('sku') || initialData?.sku || `PRD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      description: formData.get('description'),
      short_description: formData.get('short_description'),
      category_id: formData.get('category_id'),
      brand_id: formData.get('brand_id') || null,
      price: Number(formData.get('price')),
      sale_price: formData.get('sale_price') ? Number(formData.get('sale_price')) : null,
      bulk_price: formData.get('bulk_price') ? Number(formData.get('bulk_price')) : null,
      bulk_unit: formData.get('bulk_unit') || 'Dozen',
      stock_status: formData.get('stock_status'),
      is_active: formData.get('is_active') === 'on',
      is_featured: formData.get('is_featured') === 'on',
      attributes: {},
    };

    try {
      const result = initialData 
        ? await updateProductAction(initialData.id, data)
        : await createProductAction(data);

      if (result.success) {
        const newProductId = initialData ? initialData.id : result.data.id;
        
        // Handle pending images for new product
        if (!initialData && pendingImages.length > 0) {
          const { v4: uuidv4 } = await import('uuid');
          
          for (let i = 0; i < pendingImages.length; i++) {
            const file = pendingImages[i];
            const fileExt = file.name.split('.').pop();
            const fileName = `${newProductId}/${uuidv4()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
              .from('products')
              .upload(fileName, file);

            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage
                .from('products')
                .getPublicUrl(fileName);

              await addProductImageRecord({
                product_id: newProductId,
                url: publicUrlData.publicUrl,
                is_primary: i === 0,
                sort_order: i,
              });
            }
          }
        }

        addToast({ title: 'Success', description: `Product ${initialData ? 'updated' : 'created'} successfully`, variant: 'success' });
        router.push('/dashboard/products');
        router.refresh();
      } else {
        addToast({ title: 'Error', description: result.error || 'Failed to save product', variant: 'destructive' });
      }
    } catch (error: any) {
      addToast({ title: 'Error', description: error.message || 'Operation failed', variant: 'destructive' });
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{initialData ? 'Edit Product' : 'Add Product'}</h1>
        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Product'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
        <div className="lg:col-span-2 space-y-8">
          
          {/* General Information Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900">General Information</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input id="name" name="name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. A4 Copy Paper" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug *</Label>
                  <Input id="slug" name="slug" required value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="a4-copy-paper" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category_id">Category *</Label>
                  <Select id="category_id" name="category_id" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                    <option value="" disabled>Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">Short Description (Excerpt)</Label>
                <Textarea id="short_description" name="short_description" rows={3} defaultValue={initialData?.short_description} placeholder="A brief summary for product cards..." />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea id="description" name="description" rows={8} defaultValue={initialData?.description} placeholder="Detailed product description..." />
              </div>
            </div>
          </div>

          {/* Product Images Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900">Product Images</h2>
            </div>
            <div className="p-6">
              <ProductImageManager 
                productId={initialData?.id} 
                initialImages={initialData?.product_images || []} 
                onPendingFilesChange={setPendingImages}
              />
            </div>
          </div>

          {/* Pricing & Inventory Card */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
              <h2 className="text-lg font-semibold text-gray-900">Pricing & Inventory</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="price">Regular Price (KSh) *</Label>
                  <Input id="price" name="price" type="number" step="0.01" required value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0.00" />
                  <p className="text-xs text-gray-500">Standard public-facing unit price.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale_price">Sale Price (KSh)</Label>
                  <Input id="sale_price" name="sale_price" type="number" step="0.01" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="Optional" />
                  <p className="text-xs text-gray-500">Discounted public price. Overrides regular price if set.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulk_price">Bulk Price (KSh)</Label>
                  <Input id="bulk_price" name="bulk_price" type="number" step="0.01" value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)} placeholder="Optional" />
                  <p className="text-xs text-gray-500">Wholesale rate shown when bulk pricing is active.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bulk_unit">Bulk Unit</Label>
                  <Input id="bulk_unit" name="bulk_unit" value={bulkUnit} onChange={(e) => setBulkUnit(e.target.value)} placeholder="e.g. Dozen, Box" />
                  <p className="text-xs text-gray-500">The unit label for bulk orders.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_status">Stock Status *</Label>
                  <Select id="stock_status" name="stock_status" defaultValue={initialData?.stock_status || 'IN_STOCK'}>
                    <option value="IN_STOCK">In Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                    <option value="PRE_ORDER">Pre Order</option>
                    <option value="DISCONTINUED">Discontinued</option>
                  </Select>
                </div>
              </div>
            </div>
          </div>

        </div>
        
        <div className="space-y-8">
          {/* Organization Sidebar */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50/50">
              <h3 className="font-semibold text-gray-900">Organization</h3>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active" className="cursor-pointer">Published</Label>
                  <input 
                    type="checkbox" 
                    id="is_active" 
                    name="is_active" 
                    defaultChecked={initialData ? initialData.is_active : true}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500">Make this product visible on the storefront.</p>
              </div>

              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_featured" className="cursor-pointer">Featured</Label>
                  <input 
                    type="checkbox" 
                    id="is_featured" 
                    name="is_featured" 
                    defaultChecked={initialData ? initialData.is_featured : false}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500">Show this product in featured sections.</p>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm sticky top-6">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 text-sm">Storefront Preview</h3>
            </div>
            <div className="p-4">
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden border border-gray-200 relative">
                {pendingImages.length > 0 ? (
                  <img src={URL.createObjectURL(pendingImages[0])} alt="Preview" className="w-full h-full object-cover" />
                ) : initialData?.product_images?.length > 0 ? (
                  <img 
                    src={initialData.product_images.find((i: any) => i.is_primary)?.url || initialData.product_images[0].url} 
                    alt="Preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <span className="text-gray-400 text-sm">No Image</span>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">{categories.find(c => c.id === categoryId)?.name || 'Category'}</p>
                <h4 className="font-medium text-gray-900 line-clamp-2">{name || 'Product Name'}</h4>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-bold text-gray-900">KSh {salePrice ? Number(salePrice).toLocaleString() : (price ? Number(price).toLocaleString() : '0.00')}</span>
                  {salePrice && (
                    <span className="text-xs text-gray-500 line-through">KSh {Number(price).toLocaleString()}</span>
                  )}
                  {bulkPrice && (
                    <span className="text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5">
                      Bulk: KSh {Number(bulkPrice).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
