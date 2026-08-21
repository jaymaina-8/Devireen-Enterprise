import { createClient } from '@/lib/supabase/server';
import { DatabaseError } from '@/lib/errors/DatabaseError';
import { logger } from '@/lib/logger';

export class MediaRepository {
  static async getProductImages(productId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true });

    if (error) {
      logger.error(`Failed to fetch images for product ${productId}`, error);
      throw new DatabaseError('Failed to fetch product images');
    }

    return data || [];
  }
}
