'use server';

import { BrandRepository } from '@/lib/supabase/repositories/brand.repository';
import { brandSchema } from '@/lib/validation/brand.schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { verifyAdminServerAction } from '@/lib/auth/authorization';
import { createSafeAction } from '@/lib/actions/withErrorHandling';
import { rateLimit } from '@/lib/rate-limit';

export const createBrandAction = createSafeAction(
  'createBrandAction',
  async (formData: FormData) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    const rawData = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      logo_url: formData.get('logo_url'),
      description: formData.get('description'),
    };

    const validatedData = brandSchema.parse(rawData);
    await BrandRepository.createBrand(validatedData);

    revalidatePath('/dashboard/brands');
    redirect('/dashboard/brands');
  }
);

export const updateBrandAction = createSafeAction(
  'updateBrandAction',
  async (id: string, formData: FormData) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    const rawData = {
      name: formData.get('name'),
      slug: formData.get('slug'),
      logo_url: formData.get('logo_url'),
      description: formData.get('description'),
    };

    const validatedData = brandSchema.parse(rawData);
    await BrandRepository.updateBrand(id, validatedData);

    revalidatePath('/dashboard/brands');
    redirect('/dashboard/brands');
  }
);

export const deleteBrandAction = createSafeAction(
  'deleteBrandAction',
  async (id: string) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    await BrandRepository.deleteBrand(id);
    revalidatePath('/dashboard/brands');
    return true;
  }
);
