'use server';

import {
  assertAllowedStorageLocation,
  StorageService,
} from '@/lib/supabase/storage';
import { revalidatePath } from 'next/cache';
import { verifyAdminServerAction } from '@/lib/auth/authorization';
import { createSafeAction } from '@/lib/actions/withErrorHandling';
import { rateLimit } from '@/lib/rate-limit';

export const uploadMediaAction = createSafeAction(
  'uploadMediaAction',
  async (formData: FormData) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;

    if (!file || !bucket) {
      throw new Error('File and bucket are required');
    }

    // Validate size (e.g. 15MB for high-res phone cameras)
    if (file.size > 15 * 1024 * 1024) {
      throw new Error('File exceeds 15MB limit');
    }

    const explicitPath = formData.get('path') as string;
    if (!explicitPath) {
      throw new Error('An approved storage path is required');
    }

    assertAllowedStorageLocation(bucket, explicitPath);

    const extension = explicitPath.split('.').pop()?.toLowerCase();
    const allowedMimeTypes: Record<string, string[]> = {
      jpg: [
        'image/jpeg',
        'image/jpg',
        'image/pjpeg',
        'application/octet-stream',
        '',
      ],
      jpeg: [
        'image/jpeg',
        'image/jpg',
        'image/pjpeg',
        'application/octet-stream',
        '',
      ],
      png: ['image/png', 'image/x-png', 'application/octet-stream', ''],
      webp: ['image/webp', 'application/octet-stream', ''],
      gif: ['image/gif', 'application/octet-stream', ''],
      heic: ['image/heic', 'image/heif', 'application/octet-stream', ''],
      heif: ['image/heic', 'image/heif', 'application/octet-stream', ''],
    };

    if (
      !extension ||
      (file.type &&
        allowedMimeTypes[extension] &&
        !allowedMimeTypes[extension].includes(file.type.toLowerCase()))
    ) {
      throw new Error('File type does not match the approved storage path');
    }

    const path = await StorageService.uploadFile(bucket, explicitPath, file);

    revalidatePath('/dashboard/media');
    return { path };
  }
);

export const deleteMediaAction = createSafeAction(
  'deleteMediaAction',
  async (bucket: string, path: string) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    await StorageService.deleteFile(bucket, path);
    revalidatePath('/dashboard/media');
    return true;
  }
);
