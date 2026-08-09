'use server';

import { StorageService } from '@/lib/supabase/storage';
import { revalidatePath } from 'next/cache';
import { verifyAdminServerAction } from '@/lib/auth/authorization';

export async function uploadMediaAction(formData: FormData) {
  try {
    await verifyAdminServerAction();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;

    if (!file || !bucket) {
      return { success: false, error: 'File and bucket are required' };
    }

    // Validate size (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File exceeds 5MB limit' };
    }

    // Validate type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      return { success: false, error: 'Invalid file type' };
    }

    const fileExt = file.name.split('.').pop();
    const explicitPath = formData.get('path') as string;
    const fileName =
      explicitPath ||
      `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    // We import createAdminClient locally to avoid circular dependencies if any,
    // or we can just update StorageService itself. Let's rely on StorageService.
    const path = await StorageService.uploadFile(bucket, fileName, file);

    revalidatePath('/dashboard/media');
    return { success: true, path };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteMediaAction(bucket: string, path: string) {
  try {
    await verifyAdminServerAction();
    await StorageService.deleteFile(bucket, path);
    revalidatePath('/dashboard/media');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
