import { env } from '@/lib/env';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import { DatabaseError } from '@/lib/errors/DatabaseError';

const PRODUCT_BUCKET = 'products';
const PRODUCT_MEDIA_PATH =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|jpeg|png|webp|gif|heic|heif)$/i;

export function assertAllowedStorageLocation(bucket: string, path: string) {
  if (bucket !== PRODUCT_BUCKET || !PRODUCT_MEDIA_PATH.test(path)) {
    throw new DatabaseError('Unsupported storage location');
  }
}

export class StorageService {
  /**
   * Uploads a file to a specified bucket.
   */
  static async uploadFile(
    bucket: string,
    path: string,
    file: File
  ): Promise<string> {
    assertAllowedStorageLocation(bucket, path);
    const supabase = await createAdminClient();
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        upsert: true,
      });

    if (error) {
      logger.error(`Storage upload failed for ${path} in ${bucket}`, error);
      throw new DatabaseError(`Failed to upload file to ${bucket}`);
    }
    return data.path;
  }

  /**
   * Deletes a file from a specified bucket.
   */
  static async deleteFile(bucket: string, path: string): Promise<void> {
    assertAllowedStorageLocation(bucket, path);
    const supabase = await createAdminClient();
    const { error } = await supabase.storage.from(bucket).remove([path]);

    if (error) {
      logger.error(`Storage delete failed for ${path} in ${bucket}`, error);
      throw new DatabaseError(`Failed to delete file from ${bucket}`);
    }
  }

  /**
   * Generates a public URL for a file in a public bucket.
   */
  static getPublicUrl(bucket: string, path: string): string {
    return `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
  }

  /**
   * Lists files in a specified bucket.
   */
  static async listFiles(bucket: string, path: string = '') {
    if (bucket !== PRODUCT_BUCKET || path !== '') {
      throw new DatabaseError('Unsupported storage location');
    }
    const supabase = await createClient();
    const { data, error } = await supabase.storage.from(bucket).list(path, {
      limit: 100,
      offset: 0,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
      logger.error(`Storage list failed for ${bucket}/${path}`, error);
      throw new DatabaseError(`Failed to list files in ${bucket}`);
    }
    return data;
  }
}
