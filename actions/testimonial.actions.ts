'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminServerAction } from '@/lib/auth/authorization';
import { createSafeAction } from '@/lib/actions/withErrorHandling';
import { rateLimit } from '@/lib/rate-limit';

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

export const fetchTestimonialsForAdmin = createSafeAction(
  'fetchTestimonialsForAdmin',
  async (options?: { query?: string; publishedOnly?: boolean }) => {
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
      console.warn(
        'Fetch testimonials warning:',
        error.message || error.code || 'Table may not exist yet'
      );
      return [];
    }

    return data || [];
  }
);

export const createTestimonialAction = createSafeAction(
  'createTestimonialAction',
  async (data: TestimonialInput) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
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
      throw new Error(error.message);
    }

    revalidatePath('/dashboard/testimonials');
    revalidatePath('/');
    return newRecord;
  }
);

export const updateTestimonialAction = createSafeAction(
  'updateTestimonialAction',
  async (id: string, data: Partial<TestimonialInput>) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
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
      throw new Error(error.message);
    }

    revalidatePath('/dashboard/testimonials');
    revalidatePath('/');
    return updated;
  }
);

export const deleteTestimonialAction = createSafeAction(
  'deleteTestimonialAction',
  async (id: string) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    const supabase = await createClient();

    const { error } = await supabase
      .from('testimonials')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/dashboard/testimonials');
    revalidatePath('/');
    return true;
  }
);

export const togglePublishTestimonialAction = createSafeAction(
  'togglePublishTestimonialAction',
  async (id: string, is_published: boolean) => {
    return (await updateTestimonialAction(id, { is_published })).data;
  }
);

export const toggleFeaturedTestimonialAction = createSafeAction(
  'toggleFeaturedTestimonialAction',
  async (id: string, is_featured: boolean) => {
    return (await updateTestimonialAction(id, { is_featured })).data;
  }
);

export const reorderTestimonialsAction = createSafeAction(
  'reorderTestimonialsAction',
  async (items: { id: string; display_order: number }[]) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    const supabase = await createClient();

    for (const item of items) {
      await supabase
        .from('testimonials')
        .update({ display_order: item.display_order })
        .eq('id', item.id);
    }

    revalidatePath('/dashboard/testimonials');
    revalidatePath('/');
    return true;
  }
);
