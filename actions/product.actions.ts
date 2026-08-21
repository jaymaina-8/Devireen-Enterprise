'use server';

import { ProductRepository } from '@/lib/supabase/repositories/product.repository';
import { createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminServerAction } from '@/lib/auth/authorization';
import { productSchema } from '@/lib/validation/product.schema';
import { createSafeAction } from '@/lib/actions/withErrorHandling';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const fetchProducts = createSafeAction(
  'fetchProducts',
  async (params?: {
    query?: string;
    categorySlug?: string;
    context?: 'retail' | 'wholesale';
  }) => {
    const ip = await getClientIp();
    const rateLimitResult = await rateLimit(ip, 'PUBLIC_READ');
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    return await ProductRepository.getProducts(params);
  }
);

export const fetchProductBySlug = createSafeAction(
  'fetchProductBySlug',
  async (slug: string) => {
    const ip = await getClientIp();
    const rateLimitResult = await rateLimit(ip, 'PUBLIC_READ');
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    return await ProductRepository.getProductBySlug(slug);
  }
);

export const fetchProductsForAdmin = createSafeAction(
  'fetchProductsForAdmin',
  async (params?: {
    query?: string;
    categorySlug?: string;
    page?: number;
    pageSize?: number;
  }) => {
    await verifyAdminServerAction();
    const result = await ProductRepository.getProductsForAdmin(params);
    return { success: true, data: result.data, count: result.count };
  }
);

export const createProductAction = createSafeAction(
  'createProductAction',
  async (productData: any) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    const validData = productSchema.parse(productData);
    const product = await ProductRepository.createProduct(validData);
    revalidatePath('/dashboard/products');
    revalidatePath('/products');
    return product;
  }
);

export const updateProductAction = createSafeAction(
  'updateProductAction',
  async (id: string, productData: any) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    const validData = productSchema.parse(productData);
    const product = await ProductRepository.updateProduct(id, validData);
    revalidatePath('/dashboard/products');
    revalidatePath(`/products/${product.slug}`);
    revalidatePath('/products');
    return product;
  }
);

export const deleteProductAction = createSafeAction(
  'deleteProductAction',
  async (id: string) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    await ProductRepository.deleteProduct(id);
    revalidatePath('/dashboard/products');
    revalidatePath('/products');
    return true;
  }
);

export const addProductImageRecord = createSafeAction(
  'addProductImageRecord',
  async (imageData: any) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('product_images')
      .insert([imageData])
      .select()
      .single();

    if (error) throw new Error(error.message);
    revalidatePath(`/dashboard/products/${imageData.product_id}`);
    return data;
  }
);

export const deleteProductImageRecord = createSafeAction(
  'deleteProductImageRecord',
  async (imageId: string, productId: string) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (error) throw new Error(error.message);
    revalidatePath(`/dashboard/products/${productId}`);
    return true;
  }
);

export const setPrimaryProductImageRecord = createSafeAction(
  'setPrimaryProductImageRecord',
  async (imageId: string, productId: string) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    const supabase = await createAdminClient();

    // First, set all to false
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', productId);

    // Then set the selected to true
    const { error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', imageId);

    if (error) throw new Error(error.message);
    revalidatePath(`/dashboard/products/${productId}`);
    return true;
  }
);

export const toggleProductFeaturedAction = createSafeAction(
  'toggleProductFeaturedAction',
  async (id: string, isFeatured: boolean) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('products')
      .update({ is_featured: isFeatured, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, is_featured')
      .single();

    if (error) throw new Error(error.message);
    revalidatePath('/dashboard/products');
    revalidatePath('/products');
    return data;
  }
);
