'use server';

import { StorageService } from '@/lib/supabase/storage';
import { revalidatePath } from 'next/cache';
import { verifyAdminServerAction } from '@/lib/auth/authorization';
import { createSafeAction } from '@/lib/actions/withErrorHandling';

export const uploadMediaAction = createSafeAction(
  'uploadMediaAction',
  async (formData: FormData) => {
    await verifyAdminServerAction();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;

    if (!file || !bucket) {
      throw new Error('File and bucket are required');
    }

    // Validate size (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('File exceeds 5MB limit');
    }

    // Validate type
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      throw new Error('Invalid file type');
    }

    const fileExt = file.name.split('.').pop();
    const explicitPath = formData.get('path') as string;
    const fileName =
      explicitPath ||
      `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const path = await StorageService.uploadFile(bucket, fileName, file);

    revalidatePath('/dashboard/media');
    return { path };
  }
);

export const deleteMediaAction = createSafeAction(
  'deleteMediaAction',
  async (bucket: string, path: string) => {
    await verifyAdminServerAction();
    await StorageService.deleteFile(bucket, path);
    revalidatePath('/dashboard/media');
    return true;
  }
);
