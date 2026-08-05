'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createProductAction,
  updateProductAction,
  addProductImageRecord,
} from '@/actions/product.actions';
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

export function ProductForm({
  initialData,
  categories,
  brands,
}: ProductFormProps) {
  const router = useRouter();
  const { addToast } = useToastStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [price, setPrice] = useState(initialData?.price || '');
  const [salePrice, setSalePrice] = useState(initialData?.sale_price || '');
  const [wholesalePrice, setWholesalePrice] = useState(
    initialData?.wholesale_price || ''
  );
  const [wholesaleUnit, setWholesaleUnit] = useState(
    initialData?.wholesale_unit || 'Dozen'
  );
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initialData?.categories?.map((c: any) => c.id).filter(Boolean) || []
  );
  const [isAllCategories, setIsAllCategories] = useState<boolean>(
    initialData?.is_all_categories || false
  );
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
      sku:
        formData.get('sku') ||
        initialData?.sku ||
        `PRD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      description: formData.get('description'),
      short_description: formData.get('short_description'),
      category_ids: categoryIds,
      is_all_categories: isAllCategories,
      brand_id: formData.get('brand_id') || null,
      price: Number(formData.get('price')),
      sale_price: formData.get('sale_price')
        ? Number(formData.get('sale_price'))
        : null,
      wholesale_price: formData.get('wholesale_price')
        ? Number(formData.get('wholesale_price'))
        : null,
      wholesale_unit: formData.get('wholesale_unit') || 'Dozen',
      stock_status: formData.get('stock_status'),
      is_active: formData.get('is_active') === 'on',
      is_featured: formData.get('is_featured') === 'on',
      show_in_retail: formData.get('show_in_retail') === 'on',
      show_in_wholesale: formData.get('show_in_wholesale') === 'on',
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

        addToast({
          title: 'Success',
          description: `Product ${initialData ? 'updated' : 'created'} successfully`,
          variant: 'success',
        });
        router.push('/dashboard/products');
        router.refresh();
      } else {
        addToast({
          title: 'Error',
          description: result.error || 'Failed to save product',
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
    <form onSubmit={handleSubmit} className="max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {initialData ? 'Edit Product' : 'Add Product'}
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 pb-12 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* General Information Card */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                General Information
              </h2>
            </div>
            <div className="space-y-6 p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. A4 Copy Paper"
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
                    placeholder="a4-copy-paper"
                  />
                </div>

                <div className="space-y-4">
                  <Label>Categories *</Label>
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_all_categories"
                      checked={isAllCategories}
                      onChange={(e) => setIsAllCategories(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label
                      htmlFor="is_all_categories"
                      className="cursor-pointer font-medium text-blue-700"
                    >
                      Apply to All Categories
                    </Label>
                  </div>

                  {!isAllCategories && (
                    <div className="grid max-h-48 grid-cols-2 gap-2 overflow-y-auto rounded-md border border-gray-200 bg-gray-50 p-2">
                      {categories.map((c) => (
                        <label
                          key={c.id}
                          className="flex cursor-pointer items-center gap-2 rounded p-1 text-sm hover:bg-gray-100"
                        >
                          <input
                            type="checkbox"
                            checked={categoryIds.includes(c.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCategoryIds([...categoryIds, c.id]);
                              } else {
                                setCategoryIds(
                                  categoryIds.filter((id) => id !== c.id)
                                );
                              }
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          {c.name}
                        </label>
                      ))}
                    </div>
                  )}
                  {!isAllCategories && categoryIds.length === 0 && (
                    <p className="text-xs text-red-500">
                      Please select at least one category.
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="short_description">
                  Short Description (Excerpt)
                </Label>
                <Textarea
                  id="short_description"
                  name="short_description"
                  rows={3}
                  defaultValue={initialData?.short_description}
                  placeholder="A brief summary for product cards..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={8}
                  defaultValue={initialData?.description}
                  placeholder="Detailed product description..."
                />
              </div>
            </div>
          </div>

          {/* Product Images Card */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Product Images
              </h2>
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
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Pricing & Inventory
              </h2>
            </div>
            <div className="p-6">
              <div className="grid max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Regular Price (KSh) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                  />
                  <p className="text-xs text-gray-500">
                    Standard public-facing unit price.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sale_price">Sale Price (KSh)</Label>
                  <Input
                    id="sale_price"
                    name="sale_price"
                    type="number"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="Optional"
                  />
                  <p className="text-xs text-gray-500">
                    Discounted public price. Overrides regular price if set.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wholesale_price">Wholesale Price (KSh)</Label>
                  <Input
                    id="wholesale_price"
                    name="wholesale_price"
                    type="number"
                    step="0.01"
                    value={wholesalePrice}
                    onChange={(e) => setWholesalePrice(e.target.value)}
                    placeholder="Optional"
                  />
                  <p className="text-xs text-gray-500">
                    Wholesale rate shown when wholesale pricing is active.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wholesale_unit">Wholesale Unit</Label>
                  <Input
                    id="wholesale_unit"
                    name="wholesale_unit"
                    value={wholesaleUnit}
                    onChange={(e) => setWholesaleUnit(e.target.value)}
                    placeholder="e.g. Dozen, Box"
                  />
                  <p className="text-xs text-gray-500">
                    The unit label for wholesale orders.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_status">Stock Status *</Label>
                  <Select
                    id="stock_status"
                    name="stock_status"
                    defaultValue={initialData?.stock_status || 'IN_STOCK'}
                  >
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
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50/50 px-5 py-4">
              <h3 className="font-semibold text-gray-900">Organization</h3>
            </div>
            <div className="space-y-4 p-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Published
                  </Label>
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    defaultChecked={initialData ? initialData.is_active : true}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Make this product visible on the storefront.
                </p>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="is_featured" className="cursor-pointer">
                    Featured
                  </Label>
                  <input
                    type="checkbox"
                    id="is_featured"
                    name="is_featured"
                    defaultChecked={
                      initialData ? initialData.is_featured : false
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Show this product in featured sections.
                </p>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_in_retail" className="cursor-pointer">
                    Show in Retail
                  </Label>
                  <input
                    type="checkbox"
                    id="show_in_retail"
                    name="show_in_retail"
                    defaultChecked={
                      initialData ? initialData.show_in_retail : true
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Make this product visible on the main product page.
                </p>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show_in_wholesale" className="cursor-pointer">
                    Show in Wholesale
                  </Label>
                  <input
                    type="checkbox"
                    id="show_in_wholesale"
                    name="show_in_wholesale"
                    defaultChecked={
                      initialData ? initialData.show_in_wholesale : true
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Make this product visible on the wholesale order page.
                </p>
              </div>
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="sticky top-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
              <h3 className="text-sm font-semibold text-gray-900">
                Storefront Preview
              </h3>
            </div>
            <div className="p-4">
              <div className="relative mb-4 flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                {pendingImages.length > 0 ? (
                  <img
                    src={URL.createObjectURL(pendingImages[0])}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : initialData?.product_images?.length > 0 ? (
                  <img
                    src={
                      initialData.product_images.find((i: any) => i.is_primary)
                        ?.url || initialData.product_images[0].url
                    }
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-sm text-gray-400">No Image</span>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  {isAllCategories
                    ? 'All Categories'
                    : categoryIds.length > 0
                      ? categories
                          .filter((c) => categoryIds.includes(c.id))
                          .map((c) => c.name)
                          .join(', ')
                      : 'Category'}
                </p>
                <h4 className="line-clamp-2 font-medium text-gray-900">
                  {name || 'Product Name'}
                </h4>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-bold text-gray-900">
                    KSh{' '}
                    {salePrice
                      ? Number(salePrice).toLocaleString()
                      : price
                        ? Number(price).toLocaleString()
                        : '0.00'}
                  </span>
                  {salePrice && (
                    <span className="text-xs text-gray-500 line-through">
                      KSh {Number(price).toLocaleString()}
                    </span>
                  )}
                  {wholesalePrice && (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Wholesale: KSh {Number(wholesalePrice).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 border-t border-gray-200 pt-6 pb-8">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save Product'}
        </Button>
      </div>
    </form>
  );
}
