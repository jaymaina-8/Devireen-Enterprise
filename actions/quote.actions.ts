'use server';

import { QuoteRepository } from '@/lib/supabase/repositories/quote.repository';
import { verifyAdminServerAction } from '@/lib/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createSafeAction } from '@/lib/actions/withErrorHandling';

import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const fetchCustomerQuotes = createSafeAction(
  'fetchCustomerQuotes',
  async (customerId: string) => {
    return await QuoteRepository.getQuotesByCustomer(customerId);
  }
);

export const createQuote = createSafeAction(
  'createQuote',
  async (payload: any) => {
    const ip = await getClientIp();
    const rateLimitResult = await rateLimit(ip, 'QUOTE_CREATE');
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    return await QuoteRepository.createQuote(payload);
  }
);

export const createQuoteAction = createSafeAction(
  'createQuoteAction',
  async (payload: any) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    await QuoteRepository.createAdminQuote(payload);
    revalidatePath('/dashboard/quotes');
    return true;
  }
);

export const updateQuoteAction = createSafeAction(
  'updateQuoteAction',
  async (id: string, payload: any) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    await QuoteRepository.updateAdminQuote(id, payload);
    revalidatePath('/dashboard/quotes');
    return true;
  }
);

export const convertQuoteToOrderAction = createSafeAction(
  'convertQuoteToOrderAction',
  async (quoteId: string) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    const supabase = await createClient();

    const { data: orderId, error } = await supabase.rpc(
      'convert_quote_to_order_rpc',
      {
        p_quote_id: quoteId,
      }
    );

    if (error) {
      // Throw error to be caught by wrapper
      throw new Error(error.message);
    }

    revalidatePath('/dashboard/quotes');
    revalidatePath('/dashboard/orders');

    return { orderId };
  }
);
