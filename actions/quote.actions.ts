'use server';

import { QuoteRepository } from '@/lib/supabase/repositories/quote.repository';
import { verifyAdminServerAction } from '@/lib/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createSafeAction } from '@/lib/actions/withErrorHandling';

export const fetchCustomerQuotes = createSafeAction(
  'fetchCustomerQuotes',
  async (customerId: string) => {
    return await QuoteRepository.getQuotesByCustomer(customerId);
  }
);

export const createQuote = createSafeAction(
  'createQuote',
  async (payload: any) => {
    return await QuoteRepository.createQuote(payload);
  }
);

export const createQuoteAction = createSafeAction(
  'createQuoteAction',
  async (payload: any) => {
    await verifyAdminServerAction();
    await QuoteRepository.createAdminQuote(payload);
    revalidatePath('/dashboard/quotes');
    return true;
  }
);

export const updateQuoteAction = createSafeAction(
  'updateQuoteAction',
  async (id: string, payload: any) => {
    await verifyAdminServerAction();
    await QuoteRepository.updateAdminQuote(id, payload);
    revalidatePath('/dashboard/quotes');
    return true;
  }
);

export const convertQuoteToOrderAction = createSafeAction(
  'convertQuoteToOrderAction',
  async (quoteId: string) => {
    await verifyAdminServerAction();
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
