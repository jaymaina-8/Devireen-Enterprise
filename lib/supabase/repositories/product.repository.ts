import { createClient, createAdminClient } from '@/lib/supabase/server';
import { DatabaseError } from '@/lib/errors/DatabaseError';
import { logger } from '@/lib/logger';

export class ProductRepository {
  static async getProducts(params?: {
    query?: string;
    categorySlug?: string;
    context?: 'retail' | 'wholesale';
  }) {
    const supabase = await createClient();
    let dbQuery = supabase
      .from('products')
      .select(
        '*, categories!inner(name, slug), brands(name), product_images(url, is_primary, alt_text)'
      )
      .eq('is_active', true)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (params?.context === 'retail') {
      dbQuery = dbQuery.eq('show_in_retail', true);
    }
    if (params?.context === 'wholesale') {
      dbQuery = dbQuery.eq('show_in_wholesale', true);
    }

    if (params?.categorySlug) {
      dbQuery = dbQuery.eq('categories.slug', params.categorySlug);
    }

    if (params?.query && params.query.trim() !== '') {
      const searchTerm = params.query.trim();
      dbQuery = dbQuery.or(
        `name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`
      );
    }

    const { data, error } = await dbQuery;

    if (error) {
      logger.error('Failed to retrieve products', error);
      throw new DatabaseError('Database error while retrieving products');
    }
    return data;
  }

  static async getProductBySlug(slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(*), brands(*), product_images(*, alt_text)')
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (error) {
      logger.error(`Failed to retrieve product with slug: ${slug}`, error);
      throw new DatabaseError('Database error while retrieving product');
    }
    return data;
  }

  static async getProductsForAdmin(params?: {
    query?: string;
    categorySlug?: string;
    page?: number;
    pageSize?: number;
  }) {
    const supabase = await createClient();
    let dbQuery = supabase
      .from('products')
      .select(
        '*, categories(name), brands(name), product_images(url, is_primary)',
        { count: 'exact' }
      )
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (params?.query && params.query.trim() !== '') {
      const searchTerm = params.query.trim();
      dbQuery = dbQuery.or(
        `name.ilike.%${searchTerm}%,sku.ilike.%${searchTerm}%,short_description.ilike.%${searchTerm}%`
      );
    }

    if (params?.page && params?.pageSize) {
      const from = (params.page - 1) * params.pageSize;
      const to = from + params.pageSize - 1;
      dbQuery = dbQuery.range(from, to);
    }

    const { data, count, error } = await dbQuery;

    if (error) {
      logger.error('Failed to retrieve products for admin', error);
      throw new DatabaseError('Database error while retrieving products');
    }
    return { data, count };
  }

  static async createProduct(productData: any) {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) {
      logger.error('Failed to create product', error);
      throw new DatabaseError(
        `Database error while creating product: ${error.message}`
      );
    }
    return data;
  }

  static async updateProduct(id: string, productData: any) {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('products')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error(`Failed to update product with id: ${id}`, error);
      throw new DatabaseError(
        `Database error while updating product: ${error.message}`
      );
    }
    return data;
  }

  static async deleteProduct(id: string) {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from('products')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      logger.error(`Failed to delete product with id: ${id}`, error);
      throw new DatabaseError('Database error while deleting product');
    }
    return true;
  }
}
