import { createClient, createAdminClient } from '@/lib/supabase/server';
import { DatabaseError } from '@/lib/errors/DatabaseError';
import { logger } from '@/lib/logger';
import type { AdminQuoteInput } from '@/lib/validation/quote.schema';

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

    let totalAmount = 0;
    let quoteItemsData: any[] = [];

    if (Array.isArray(payload.items) && payload.items.length > 0) {
      // Fetch authoritative product prices
      const productIds = payload.items
        .map((i: any) => i.productId)
        .filter(Boolean);
      if (productIds.length > 0) {
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

        if (products && products.length > 0) {
          const productPriceMap = new Map(
            products.map((p) => [
              p.id,
              p.sale_price !== null && p.sale_price > 0
                ? p.sale_price
                : p.price || 0,
            ])
          );

          quoteItemsData = payload.items
            .filter((item: any) => productPriceMap.has(item.productId))
            .map((item: any) => {
              const authoritativePrice =
                productPriceMap.get(item.productId) || 0;
              totalAmount += item.quantity * authoritativePrice;

              return {
                product_id: item.productId,
                quantity: item.quantity,
                unit_price: authoritativePrice,
              };
            });
        }
      }
    }

    if (
      quoteItemsData.length === 0 &&
      (!payload.notes || payload.notes.trim().length === 0)
    ) {
      throw new DatabaseError(
        'Please select products or specify your quotation requirements in the notes field.'
      );
    }

    let vatRate = 16;
    try {
      const { data: settings, error: settingsError } = await adminSupabase
        .from('settings')
        .select('enable_vat, vat_rate')
        .limit(1)
        .maybeSingle();

      if (settingsError) {
        logger.warn(
          'Failed to retrieve VAT settings for quote, defaulting to 16%',
          settingsError
        );
      } else if (settings) {
        vatRate =
          settings.enable_vat === false ? 0 : Number(settings.vat_rate ?? 16);
      }
    } catch (err) {
      logger.warn('Error fetching settings for quote tax, using 16%', err);
    }

    const vatAmount = Number(((totalAmount * vatRate) / 100).toFixed(2));

    // Find or create customer record for this quote
    let customerId: string | null = null;
    try {
      const email = payload.email?.trim() || '';
      const phone = payload.phone?.trim() || '';

      if (email || phone) {
        let query = adminSupabase.from('customers').select('id').limit(1);
        if (email && phone) {
          query = query.or(
            `contact_email.eq.${email},contact_phone.eq.${phone}`
          );
        } else if (email) {
          query = query.eq('contact_email', email);
        } else {
          query = query.eq('contact_phone', phone);
        }

        const { data: existingCustomer } = await query.maybeSingle();
        if (existingCustomer?.id) {
          customerId = existingCustomer.id;
        } else {
          const { data: newCustomer, error: newCustErr } = await adminSupabase
            .from('customers')
            .insert({
              company_name:
                payload.companyName || payload.contactName || 'Direct Customer',
              contact_name:
                payload.contactName || payload.companyName || 'Direct Customer',
              contact_email: email || null,
              contact_phone: phone || null,
              type: payload.companyName ? 'WHOLESALE' : 'RETAIL',
            })
            .select('id')
            .single();

          if (!newCustErr && newCustomer?.id) {
            customerId = newCustomer.id;
          }
        }
      }
    } catch (custErr) {
      logger.warn(
        'Failed to find or create customer record for quote',
        custErr
      );
    }

    // Insert Quote via admin client to bypass RLS
    const { data: quote, error: quoteError } = await adminSupabase
      .from('quotes')
      .insert({
        session_id: sessionId,
        customer_id: customerId,
        status: 'PENDING',
        notes: `Company: ${payload.companyName || 'N/A'}\nContact: ${payload.contactName}\nEmail: ${payload.email}\nPhone: ${payload.phone}\nNotes: ${payload.notes || ''}`,
        subtotal_amount: totalAmount,
        vat_rate: vatRate,
        vat_amount: vatAmount,
        total_amount: totalAmount + vatAmount,
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

    // Insert alert in activity logs for dashboard attendant notification
    try {
      await adminSupabase.from('activity_logs').insert({
        action: 'created',
        entity_type: 'quote',
        entity_id: quote.id,
        details: {
          customer_name: payload.contactName,
          company_name: payload.companyName || 'Direct Customer',
          total_amount: totalAmount + vatAmount,
          quote_number: quote.quote_number || quote.id.slice(0, 8),
          item_count: quoteItemsData.length,
        },
      });
    } catch (logErr) {
      logger.warn('Failed to insert activity log for quote creation', logErr);
    }

    return quote;
  }

  static async createAdminQuote(payload: AdminQuoteInput) {
    const supabase = await createClient();
    const { data: quoteId, error } = await supabase.rpc(
      'create_admin_quote_rpc',
      {
        p_customer_id: payload.customer_id,
        p_status: payload.status,
        p_notes: payload.notes || null,
        p_items: payload.items,
      }
    );

    if (error || !quoteId) {
      logger.error('Failed to create atomic admin quote', error);
      throw new DatabaseError('Failed to create quote');
    }

    return { id: quoteId };
  }

  static async updateAdminQuote(id: string, payload: AdminQuoteInput) {
    const supabase = await createClient();
    const { error } = await supabase.rpc('update_admin_quote_rpc', {
      p_quote_id: id,
      p_customer_id: payload.customer_id,
      p_status: payload.status,
      p_notes: payload.notes || null,
      p_items: payload.items,
    });

    if (error) {
      logger.error('Failed to update atomic admin quote', error);
      throw new DatabaseError('Failed to update quote');
    }

    return true;
  }

  static async deleteQuote(id: string) {
    const supabase = await createAdminClient();
    // Soft delete quote first
    const { error: softError } = await supabase
      .from('quotes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (softError) {
      logger.warn(
        'Soft delete failed on quote, attempting hard delete',
        softError
      );
      const { error: hardError } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id);

      if (hardError) {
        logger.error(`Failed to delete quote with id ${id}`, hardError);
        throw new DatabaseError(`Failed to delete quote: ${hardError.message}`);
      }
    }

    return true;
  }
}
