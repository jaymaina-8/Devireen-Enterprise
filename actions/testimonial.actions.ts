'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminServerAction } from '@/lib/auth/authorization';

export interface TestimonialInput {
  customer_name: string;
  company?: string;
  position?: string;
  photo_url?: string;
  rating: number;
  review: string;
  is_featured?: boolean;
  is_published?: boolean;
  display_order?: number;
}

export async function fetchTestimonialsForAdmin(options?: {
  query?: string;
  publishedOnly?: boolean;
}) {
  try {
    await verifyAdminServerAction();
    const supabase = await createClient();
    let query = supabase
      .from('testimonials')
      .select('*')
      .is('deleted_at', null)
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (options?.publishedOnly) {
      query = query.eq('is_published', true);
    }

    if (options?.query) {
      query = query.or(
        `customer_name.ilike.%${options.query}%,company.ilike.%${options.query}%,review.ilike.%${options.query}%`
      );
    }

    const { data, error } = await query;
    if (error) {
      // If table doesn't exist yet or PGRST error, return empty array gracefully
      console.warn(
        'Fetch testimonials warning:',
        error.message || error.code || 'Table may not exist yet'
      );
      return { success: true, data: [], error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.warn('Fetch testimonials exception:', err?.message || err);
    return { success: true, data: [] };
  }
}

export async function createTestimonialAction(data: TestimonialInput) {
  await verifyAdminServerAction();
  const supabase = await createClient();

  const { data: newRecord, error } = await supabase
    .from('testimonials')
    .insert([
      {
        customer_name: data.customer_name,
        company: data.company || null,
        position: data.position || null,
        photo_url: data.photo_url || null,
        rating: data.rating || 5,
        review: data.review,
        is_featured: data.is_featured ?? false,
        is_published: data.is_published ?? true,
        display_order: data.display_order ?? 0,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Create testimonial error:', error.message || error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/testimonials');
  revalidatePath('/');
  return { success: true, data: newRecord };
}

export async function updateTestimonialAction(
  id: string,
  data: Partial<TestimonialInput>
) {
  await verifyAdminServerAction();
  const supabase = await createClient();

  const { data: updated, error } = await supabase
    .from('testimonials')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Update testimonial error:', error.message || error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/testimonials');
  revalidatePath('/');
  return { success: true, data: updated };
}

export async function deleteTestimonialAction(id: string) {
  await verifyAdminServerAction();
  const supabase = await createClient();

  const { error } = await supabase
    .from('testimonials')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Delete testimonial error:', error.message || error);
    return { success: false, error: error.message };
  }

  revalidatePath('/dashboard/testimonials');
  revalidatePath('/');
  return { success: true };
}

export async function togglePublishTestimonialAction(
  id: string,
  is_published: boolean
) {
  return updateTestimonialAction(id, { is_published });
}

export async function toggleFeaturedTestimonialAction(
  id: string,
  is_featured: boolean
) {
  return updateTestimonialAction(id, { is_featured });
}

export async function reorderTestimonialsAction(
  items: { id: string; display_order: number }[]
) {
  await verifyAdminServerAction();
  const supabase = await createClient();

  for (const item of items) {
    await supabase
      .from('testimonials')
      .update({ display_order: item.display_order })
      .eq('id', item.id);
  }

  revalidatePath('/dashboard/testimonials');
  revalidatePath('/');
  return { success: true };
}
