import { cache } from 'react';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { DatabaseError } from '@/lib/errors/DatabaseError';
import { logger } from '@/lib/logger';

export class CategoryRepository {
  static getCategories = cache(async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('categories')
      .select('*, products(id)')
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (error) {
      logger.error('Failed to retrieve categories', error);
      throw new DatabaseError('Database error while retrieving categories');
    }

    // Transform to include product count
    return (data || []).map((cat) => ({
      ...cat,
      productCount: cat.products?.length || 0,
    }));
  });

  static async getCategoryById(id: string) {
    const supabase = await createClient();
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();
    return data;
  }

  static async createCategory(data: any) {
    try {
      const supabase = await createAdminClient();

      // Check duplicate slug
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', data.slug)
        .single();
      if (existing) {
        throw new Error('A category with this slug already exists.');
      }

      const { data: newCat, error } = await supabase
        .from('categories')
        .insert([data])
        .select()
        .single();
      if (error) throw new DatabaseError('Failed to create category');
      return newCat;
    } catch (error) {
      logger.error('Error creating category', error);
      throw error;
    }
  }

  static async updateCategory(id: string, data: any) {
    try {
      const supabase = await createAdminClient();

      // Check duplicate slug
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', data.slug)
        .neq('id', id)
        .single();
      if (existing) {
        throw new Error('A category with this slug already exists.');
      }

      const { data: updatedCat, error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new DatabaseError('Failed to update category');
      return updatedCat;
    } catch (error) {
      logger.error('Error updating category', error);
      throw error;
    }
  }

  static async deleteCategory(id: string) {
    try {
      const supabase = await createAdminClient();
      const { error } = await supabase
        .from('categories')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw new DatabaseError('Failed to delete category');
      return true;
    } catch (error) {
      logger.error('Error deleting category', error);
      throw error;
    }
  }
}
