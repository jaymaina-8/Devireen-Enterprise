'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminServerAction } from '@/lib/auth/authorization';
import { createSafeAction } from '@/lib/actions/withErrorHandling';
import { rateLimit } from '@/lib/rate-limit';

export const createCustomerAction = createSafeAction(
  'createCustomerAction',
  async (payload: {
    company_name?: string;
    type?: 'RETAIL' | 'BUSINESS';
    kra_pin?: string;
    contact_email?: string;
    contact_phone?: string;
  }) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('customers')
      .insert([
        {
          company_name: payload.company_name || null,
          type: payload.type || 'BUSINESS',
          kra_pin: payload.kra_pin || null,
          contact_email: payload.contact_email || null,
          contact_phone: payload.contact_phone || null,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/dashboard/customers');
    return data;
  }
);

export const updateCustomerAction = createSafeAction(
  'updateCustomerAction',
  async (id: string, payload: any) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('customers')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/dashboard/customers');
    revalidatePath(`/dashboard/customers/${id}`);
    return data;
  }
);

export const deleteCustomerAction = createSafeAction(
  'deleteCustomerAction',
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
      .from('customers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    revalidatePath('/dashboard/customers');
    return true;
  }
);
