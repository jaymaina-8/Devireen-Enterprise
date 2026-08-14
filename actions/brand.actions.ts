'use server';

import { BrandRepository } from '@/lib/supabase/repositories/brand.repository';
import { brandSchema } from '@/lib/validation/brand.schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { verifyAdminServerAction } from '@/lib/auth/authorization';
import { createSafeAction } from '@/lib/actions/withErrorHandling';

export const createBrandAction = createSafeAction(
  'createBrandAction',
  async (formData: FormData) => {
    await verifyAdminServerAction();
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
    await verifyAdminServerAction();
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
    await verifyAdminServerAction();
    await BrandRepository.deleteBrand(id);
    revalidatePath('/dashboard/brands');
    return true;
  }
);
