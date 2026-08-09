'use server';

import { SeoRepository } from '@/lib/supabase/repositories/seo.repository';
import { seoSchema } from '@/lib/validation/seo.schema';
import { revalidatePath } from 'next/cache';
import { verifyAdminServerAction } from '@/lib/auth/authorization';

export async function upsertSeoAction(formData: FormData) {
  try {
    await verifyAdminServerAction();
    const rawData = {
      id: formData.get('id') || undefined,
      entity_type: formData.get('entity_type'),
      entity_id: formData.get('entity_id') || null,
      slug: formData.get('slug') || null,
      page_title: formData.get('page_title'),
      meta_description: formData.get('meta_description') || null,
      og_title: formData.get('og_title') || null,
      og_description: formData.get('og_description') || null,
      og_image: formData.get('og_image') || null,
      canonical_url: formData.get('canonical_url') || null,
      robots_settings: formData.get('robots_settings') || 'index, follow',
      keywords: formData.get('keywords') || null,
    };

    const validatedData = seoSchema.parse(rawData);

    await SeoRepository.upsertSeoMetadata(validatedData);

    revalidatePath('/dashboard/seo');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Validation failed' };
  }
}
