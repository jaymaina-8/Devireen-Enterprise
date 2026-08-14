import { createClient, createAdminClient } from '@/lib/supabase/server';
import { DatabaseError } from '@/lib/errors/DatabaseError';
import { logger } from '@/lib/logger';

export class QuoteRepository {
  static async getQuotesByCustomer(customerId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('quotes')
      .select('*, quote_items(*, products(*))')
      .eq('customer_id', customerId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error(
        `Failed to retrieve quotes for customer: ${customerId}`,
        error
      );
      throw new DatabaseError('Database error while retrieving quotes');
    }
    return data;
  }

  static async createQuote(payload: any) {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();
    const sessionId = Math.random().toString(36).substring(2, 15);

    // Fetch authoritative product prices
    const productIds = payload.items.map((i: any) => i.productId);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, sale_price')
      .in('id', productIds)
      .is('deleted_at', null)
      .eq('is_active', true);

    if (productsError) {
      logger.error('Failed to retrieve products for quote', productsError);
      throw new DatabaseError('Failed to validate products');
    }

    if (!products || products.length === 0) {
      throw new DatabaseError('No valid products found for this quote');
    }

    const productPriceMap = new Map(
      products.map((p) => [
        p.id,
        p.sale_price !== null && p.sale_price > 0 ? p.sale_price : p.price || 0,
      ])
    );

    // Calculate total amount securely
    let totalAmount = 0;
    const quoteItemsData = payload.items
      .filter((item: any) => productPriceMap.has(item.productId))
      .map((item: any) => {
        const authoritativePrice = productPriceMap.get(item.productId) || 0;
        totalAmount += item.quantity * authoritativePrice;

        return {
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: authoritativePrice,
        };
      });

    if (quoteItemsData.length === 0) {
      throw new DatabaseError('No valid items for quote creation');
    }

    // Insert Quote via admin client to bypass RLS
    const { data: quote, error: quoteError } = await adminSupabase
      .from('quotes')
      .insert({
        session_id: sessionId,
        status: 'DRAFT',
        notes: `Company: ${payload.companyName || 'N/A'}\nContact: ${payload.contactName}\nEmail: ${payload.email}\nPhone: ${payload.phone}\nNotes: ${payload.notes || ''}`,
        total_amount: totalAmount,
      })
      .select()
      .single();

    if (quoteError) {
      logger.error('Failed to create quote', quoteError);
      throw new DatabaseError('Failed to create quote');
    }

    // Assign quote_id to items and insert them via admin client
    const itemsToInsert = quoteItemsData.map((item: any) => ({
      ...item,
      quote_id: quote.id,
    }));

    const { error: itemsError } = await adminSupabase
      .from('quote_items')
      .insert(itemsToInsert);

    if (itemsError) {
      logger.error('Failed to create quote items', itemsError);
      throw new DatabaseError('Failed to create quote items');
    }

    return quote;
  }

  static async createAdminQuote(payload: any) {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    // Fetch authoritative product prices
    const productIds = payload.items.map((i: any) => i.product_id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, sale_price')
      .in('id', productIds)
      .is('deleted_at', null)
      .eq('is_active', true);

    if (productsError) {
      logger.error('Failed to retrieve valid products for quote', productsError);
      throw new DatabaseError('Failed to validate products');
    }

    if (!products || products.length === 0) {
      throw new DatabaseError('No valid products found for this quote');
    }

    const productPriceMap = new Map(
      products.map((p) => [
        p.id,
        p.sale_price !== null && p.sale_price > 0 ? p.sale_price : p.price || 0,
      ])
    );

    // Calculate total amount securely
    let totalAmount = 0;
    const itemsToInsert = payload.items
      .filter((item: any) => productPriceMap.has(item.product_id))
      .map((item: any) => {
        const authoritativePrice = productPriceMap.get(item.product_id) || 0;
        totalAmount += item.quantity * authoritativePrice;

        return {
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: authoritativePrice,
        };
      });

    if (itemsToInsert.length === 0) {
      throw new DatabaseError('No valid items for quote creation');
    }

    // Insert Quote
    const { data: quote, error: quoteError } = await adminSupabase
      .from('quotes')
      .insert({
        customer_id: payload.customer_id,
        status: payload.status,
        notes: payload.notes,
        total_amount: totalAmount,
      })
      .select('id')
      .single();

    if (quoteError || !quote) {
      logger.error('Failed to create quote', quoteError);
      throw new DatabaseError('Failed to create quote');
    }

    // Insert Items
    const finalItemsToInsert = itemsToInsert.map((item: any) => ({
      ...item,
      quote_id: quote.id,
    }));

    const { error: itemsError } = await adminSupabase
      .from('quote_items')
      .insert(finalItemsToInsert);

    if (itemsError) {
      logger.error('Failed to create quote items', itemsError);
      throw new DatabaseError('Failed to create quote items');
    }

    return quote;
  }

  static async updateAdminQuote(id: string, payload: any) {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    // Fetch authoritative product prices
    const productIds = payload.items.map((i: any) => i.product_id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, sale_price')
      .in('id', productIds)
      .is('deleted_at', null)
      .eq('is_active', true);

    if (productsError) {
      logger.error('Failed to retrieve valid products for quote update', productsError);
      throw new DatabaseError('Failed to validate products');
    }

    if (!products || products.length === 0) {
      throw new DatabaseError('No valid products found for this quote update');
    }

    const productPriceMap = new Map(
      products.map((p) => [
        p.id,
        p.sale_price !== null && p.sale_price > 0 ? p.sale_price : p.price || 0,
      ])
    );

    // Calculate new total securely
    let totalAmount = 0;
    const itemsToInsert = payload.items
      .filter((item: any) => productPriceMap.has(item.product_id))
      .map((item: any) => {
        const authoritativePrice = productPriceMap.get(item.product_id) || 0;
        totalAmount += item.quantity * authoritativePrice;

        return {
          quote_id: id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: authoritativePrice,
        };
      });

    if (itemsToInsert.length === 0) {
      throw new DatabaseError('No valid items for quote update');
    }

    // Update Quote
    const { error: quoteError } = await adminSupabase
      .from('quotes')
      .update({
        customer_id: payload.customer_id,
        status: payload.status,
        notes: payload.notes,
        total_amount: totalAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (quoteError) {
      logger.error('Failed to update quote', quoteError);
      throw new DatabaseError('Failed to update quote');
    }

    // Delete existing items and insert new ones
    await adminSupabase.from('quote_items').delete().eq('quote_id', id);

    const { error: itemsError } = await adminSupabase
      .from('quote_items')
      .insert(itemsToInsert);

    if (itemsError) {
      logger.error('Failed to update quote items', itemsError);
      throw new DatabaseError('Failed to update quote items');
    }

    return true;
  }
}
