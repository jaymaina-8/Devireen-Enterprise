'use server';

import { QuoteRepository } from '@/lib/supabase/repositories/quote.repository';
import { verifyAdminServerAction } from '@/lib/auth/authorization';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function fetchCustomerQuotes(customerId: string) {
  try {
    const quotes = await QuoteRepository.getQuotesByCustomer(customerId);
    return { success: true, data: quotes };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createQuote(payload: any) {
  try {
    const quote = await QuoteRepository.createQuote(payload);
    return { success: true, data: quote };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createQuoteAction(payload: any) {
  await verifyAdminServerAction();
  const supabase = await createClient();

  // Fetch authoritative product prices
  const productIds = payload.items.map((i: any) => i.product_id);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, price')
    .in('id', productIds)
    .is('deleted_at', null)
    .eq('is_active', true);

  if (productsError || !products || products.length === 0) {
    return {
      success: false,
      error: 'Failed to retrieve valid products for quote',
    };
  }

  const productPriceMap = new Map(products.map((p) => [p.id, p.price || 0]));

  // Calculate total amount securely
  let total_amount = 0;
  const itemsToInsert = payload.items
    .filter((item: any) => productPriceMap.has(item.product_id))
    .map((item: any) => {
      const authoritativePrice = productPriceMap.get(item.product_id) || 0;
      total_amount += item.quantity * authoritativePrice;

      return {
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: authoritativePrice,
      };
    });

  if (itemsToInsert.length === 0) {
    return { success: false, error: 'No valid items for quote creation' };
  }

  // Insert Quote
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .insert({
      customer_id: payload.customer_id,
      status: payload.status,
      notes: payload.notes,
      total_amount,
    })
    .select('id')
    .single();

  if (quoteError || !quote) {
    return {
      success: false,
      error: quoteError?.message || 'Failed to create quote',
    };
  }

  // Insert Items (assigning quote.id)
  const finalItemsToInsert = itemsToInsert.map((item: any) => ({
    ...item,
    quote_id: quote.id,
  }));

  const { error: itemsError } = await supabase
    .from('quote_items')
    .insert(finalItemsToInsert);

  if (itemsError) {
    return { success: false, error: itemsError.message };
  }

  revalidatePath('/dashboard/quotes');
  return { success: true };
}

export async function updateQuoteAction(id: string, payload: any) {
  await verifyAdminServerAction();
  const supabase = await createClient();

  // Fetch authoritative product prices
  const productIds = payload.items.map((i: any) => i.product_id);
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, price')
    .in('id', productIds)
    .is('deleted_at', null)
    .eq('is_active', true);

  if (productsError || !products || products.length === 0) {
    return {
      success: false,
      error: 'Failed to retrieve valid products for quote',
    };
  }

  const productPriceMap = new Map(products.map((p) => [p.id, p.price || 0]));

  // Calculate total amount securely
  let total_amount = 0;
  const itemsToInsert = payload.items
    .filter((item: any) => productPriceMap.has(item.product_id))
    .map((item: any) => {
      const authoritativePrice = productPriceMap.get(item.product_id) || 0;
      total_amount += item.quantity * authoritativePrice;

      return {
        quote_id: id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: authoritativePrice,
      };
    });

  if (itemsToInsert.length === 0) {
    return { success: false, error: 'No valid items for quote update' };
  }

  // Update Quote
  const { error: quoteError } = await supabase
    .from('quotes')
    .update({
      customer_id: payload.customer_id,
      status: payload.status,
      notes: payload.notes,
      total_amount,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (quoteError) {
    return { success: false, error: quoteError.message };
  }

  // To simplify, we delete existing items and insert new ones
  await supabase.from('quote_items').delete().eq('quote_id', id);

  const { error: itemsError } = await supabase
    .from('quote_items')
    .insert(itemsToInsert);

  if (itemsError) {
    return { success: false, error: itemsError.message };
  }

  revalidatePath('/dashboard/quotes');
  return { success: true };
}

export async function convertQuoteToOrderAction(quoteId: string) {
  try {
    await verifyAdminServerAction();
    const supabase = await createClient();

    const { data: orderId, error } = await supabase.rpc(
      'convert_quote_to_order_rpc',
      {
        p_quote_id: quoteId,
      }
    );

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/quotes');
    revalidatePath('/dashboard/orders');

    return { success: true, orderId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
