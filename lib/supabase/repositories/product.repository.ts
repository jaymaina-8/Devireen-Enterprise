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

    // We can't do a simple top-level OR with joined tables in PostgREST easily.
    // If we need to filter by category slug, we will filter by product_categories.categories.slug
    // AND we also want products where is_all_categories = true.
    // To achieve this cleanly without complex views, we can do a two-step query if categorySlug is provided,
    // or just fetch all active products and filter in JS if the catalog is small, but DB is better.
    // Let's use the PostgREST foreign table filter syntax if categorySlug is present, but it's an AND condition.
    // Actually, a simpler way is to query products matching the category OR is_all_categories = true.
    // Since we are moving to product_categories, let's fetch the category_id first.
    let targetCategoryId: string | null = null;
    if (params?.categorySlug) {
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', params.categorySlug)
        .single();
      if (catData) targetCategoryId = catData.id;
    }

    let dbQuery = supabase
      .from('products')
      .select(
        '*, product_categories(categories(name, slug)), brands(name), product_images(url, is_primary, alt_text)'
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

    // Filter and map in memory for the category logic
    let filteredData = data;
    if (targetCategoryId) {
      filteredData = data.filter(
        (p: any) =>
          p.is_all_categories ||
          (p.product_categories &&
            p.product_categories.some(
              (pc: any) => pc.categories?.slug === params?.categorySlug
            ))
      );
    }

    // Map product_categories back to categories for frontend compatibility
    return filteredData.map((p: any) => ({
      ...p,
      categories: p.is_all_categories
        ? [{ name: 'All Categories', slug: 'all' }]
        : (p.product_categories || [])
            .map((pc: any) => pc.categories)
            .filter(Boolean),
    }));
  }

  static async getProductBySlug(slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('products')
      .select(
        '*, product_categories(categories(*)), brands(*), product_images(*, alt_text)'
      )
      .eq('slug', slug)
      .is('deleted_at', null)
      .single();

    if (error) {
      logger.error(`Failed to retrieve product with slug: ${slug}`, error);
      throw new DatabaseError('Database error while retrieving product');
    }

    return {
      ...data,
      categories: data.is_all_categories
        ? [{ name: 'All Categories', slug: 'all' }]
        : (data.product_categories || [])
            .map((pc: any) => pc.categories)
            .filter(Boolean),
    };
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
        '*, product_categories(categories(id, name)), brands(name), product_images(url, is_primary)',
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

    // Map product_categories back to categories for frontend compatibility
    const mappedData = data.map((p: any) => ({
      ...p,
      categories: p.is_all_categories
        ? [{ id: 'all', name: 'All Categories' }]
        : (p.product_categories || [])
            .map((pc: any) => pc.categories)
            .filter(Boolean),
    }));

    return { data: mappedData, count };
  }

  static async createProduct(productData: any) {
    const supabase = await createAdminClient();

    // Extract category data
    const { category_ids, ...restProductData } = productData;

    // Insert product
    const { data, error } = await supabase
      .from('products')
      .insert([restProductData])
      .select()
      .single();

    if (error) {
      logger.error('Failed to create product', error);
      throw new DatabaseError('Database error while creating product');
    }

    // Insert categories if not all categories
    if (
      !restProductData.is_all_categories &&
      category_ids &&
      category_ids.length > 0
    ) {
      const categoryInserts = category_ids.map((id: string) => ({
        product_id: data.id,
        category_id: id,
      }));

      const { error: catError } = await supabase
        .from('product_categories')
        .insert(categoryInserts);

      if (catError) {
        logger.error('Failed to assign product categories', catError);
      }
    }

    return data;
  }

  static async updateProduct(id: string, productData: any) {
    const supabase = await createAdminClient();

    // Extract category data
    const { category_ids, ...restProductData } = productData;

    const { data, error } = await supabase
      .from('products')
      .update({ ...restProductData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error(`Failed to update product with id: ${id}`, error);
      throw new DatabaseError('Database error while updating product');
    }

    // Update categories
    if (category_ids) {
      // First delete existing
      await supabase.from('product_categories').delete().eq('product_id', id);

      // Then insert new ones if not all categories
      if (!restProductData.is_all_categories && category_ids.length > 0) {
        const categoryInserts = category_ids.map((cid: string) => ({
          product_id: id,
          category_id: cid,
        }));

        const { error: catError } = await supabase
          .from('product_categories')
          .insert(categoryInserts);

        if (catError) {
          logger.error('Failed to assign product categories', catError);
        }
      }
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
