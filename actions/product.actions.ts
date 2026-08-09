'use server';

import { ProductRepository } from '@/lib/supabase/repositories/product.repository';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminServerAction } from '@/lib/auth/authorization';
import { productSchema } from '@/lib/validation/product.schema';
export async function fetchProducts(params?: {
  query?: string;
  categorySlug?: string;
  context?: 'retail' | 'wholesale';
}) {
  try {
    const products = await ProductRepository.getProducts(params);
    return { success: true, data: products };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchProductBySlug(slug: string) {
  try {
    const product = await ProductRepository.getProductBySlug(slug);
    return { success: true, data: product };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function fetchProductsForAdmin(params?: {
  query?: string;
  categorySlug?: string;
  page?: number;
  pageSize?: number;
}) {
  try {
    const result = await ProductRepository.getProductsForAdmin(params);
    return { success: true, data: result.data, count: result.count };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createProductAction(productData: any) {
  try {
    await verifyAdminServerAction();
    const validData = productSchema.parse(productData);
    const product = await ProductRepository.createProduct(validData);
    revalidatePath('/dashboard/products');
    revalidatePath('/products');
    return { success: true, data: product };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProductAction(id: string, productData: any) {
  try {
    await verifyAdminServerAction();
    const validData = productSchema.parse(productData);
    const product = await ProductRepository.updateProduct(id, validData);
    revalidatePath('/dashboard/products');
    revalidatePath(`/products/${productData.slug || product.slug}`);
    revalidatePath('/products');
    return { success: true, data: product };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await verifyAdminServerAction();
    await ProductRepository.deleteProduct(id);
    revalidatePath('/dashboard/products');
    revalidatePath('/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addProductImageRecord(imageData: any) {
  try {
    await verifyAdminServerAction();
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('product_images')
      .insert([imageData])
      .select()
      .single();

    if (error) throw error;
    revalidatePath(`/dashboard/products/${imageData.product_id}`);
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteProductImageRecord(
  imageId: string,
  productId: string
) {
  try {
    await verifyAdminServerAction();
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (error) throw error;
    revalidatePath(`/dashboard/products/${productId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function setPrimaryProductImageRecord(
  imageId: string,
  productId: string
) {
  try {
    await verifyAdminServerAction();
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

    if (error) throw error;
    revalidatePath(`/dashboard/products/${productId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
