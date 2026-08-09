'use server';

import { BrandRepository } from '@/lib/supabase/repositories/brand.repository';
import { brandSchema } from '@/lib/validation/brand.schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { verifyAdminServerAction } from '@/lib/auth/authorization';

export async function createBrandAction(formData: FormData) {
  try {
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
  } catch (error: any) {
    return { success: false, error: error.message || 'Validation failed' };
  }

  redirect('/dashboard/brands');
}

export async function updateBrandAction(id: string, formData: FormData) {
  try {
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
  } catch (error: any) {
    return { success: false, error: error.message || 'Validation failed' };
  }

  redirect('/dashboard/brands');
}

export async function deleteBrandAction(id: string) {
  try {
    await verifyAdminServerAction();
    await BrandRepository.deleteBrand(id);
    revalidatePath('/dashboard/brands');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
