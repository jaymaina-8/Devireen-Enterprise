import { createClient, createAdminClient } from '@/lib/supabase/server';
import { randomBytes } from 'crypto';
import { DatabaseError } from '@/lib/errors/DatabaseError';
import { logger } from '@/lib/logger';
import {
  createInvoiceAccessToken,
  hashInvoiceAccessToken,
} from '@/lib/security/invoice-access';

export interface CreateOrderPayload {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillmentType: 'DELIVERY' | 'PICKUP';
  pricingModel: 'RETAIL' | 'WHOLESALE';
  deliveryAddress?: string;
  county?: string;
  courierService?: string;
  deliveryNotes?: string;
  requiresVat?: boolean;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export class OrderRepository {
  /**
   * Creates an order and its items atomically.
   * Designed for guest/public checkout — no customer_id required.
   */
  static async createOrder(payload: CreateOrderPayload) {
    const supabase = await createClient();

    // 1. Fetch authoritative product prices
    const productIds = payload.items.map((i) => i.productId);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, price, sale_price, wholesale_price')
      .in('id', productIds)
      .eq('is_active', true)
      .is('deleted_at', null);

    if (productsError || !products) {
      logger.error('Failed to fetch products for pricing', productsError);
      throw new DatabaseError('Failed to fetch products');
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // 2. Calculate totals and build safe items
    let subtotalAmount = 0;
    const safeOrderItems = [];

    for (const item of payload.items) {
      if (!Number.isInteger(item.quantity) || item.quantity < 1) {
        throw new DatabaseError(
          'Order quantities must be whole numbers greater than zero'
        );
      }

      const product = productMap.get(item.productId);
      if (!product) {
        throw new DatabaseError(
          `Product not found or inactive: ${item.productId}`
        );
      }

      const baseRetailPrice =
        product.sale_price !== null && product.sale_price > 0
          ? product.sale_price
          : product.price;

      const authoritativePrice =
        payload.pricingModel === 'WHOLESALE' && product.wholesale_price !== null
          ? product.wholesale_price
          : baseRetailPrice;

      subtotalAmount += Number(authoritativePrice) * item.quantity;
      safeOrderItems.push({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: authoritativePrice,
      });
    }

    subtotalAmount = Number(subtotalAmount.toFixed(2));

    // 3. Resolve the tax policy server-side before the atomic insert.
    // If the customer opted out of VAT (requiresVat: false), VAT is 0.
    const adminSupabase = await createAdminClient();
    let vatRate = 0;

    if (payload.requiresVat === true) {
      try {
        const { data: settings, error: settingsError } = await adminSupabase
          .from('settings')
          .select('enable_vat, vat_rate')
          .limit(1)
          .maybeSingle();

        if (settingsError) {
          logger.warn(
            'Failed to retrieve VAT settings for order, defaulting to 16%',
            settingsError
          );
          vatRate = 16;
        } else if (settings) {
          vatRate =
            settings.enable_vat === false ? 0 : Number(settings.vat_rate ?? 16);
        }
      } catch (err) {
        logger.warn('Error connecting to admin client for VAT settings', err);
        vatRate = 16;
      }

      if (!Number.isFinite(vatRate) || vatRate < 0 || vatRate > 100) {
        vatRate = 16;
      }
    }

    const vatAmount =
      vatRate > 0 ? Number(((subtotalAmount * vatRate) / 100).toFixed(2)) : 0;
    const totalAmount = Number((subtotalAmount + vatAmount).toFixed(2));
    const invoiceAccessToken = createInvoiceAccessToken();
    const invoiceNumber = `INV-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '')}-${randomBytes(6).toString('hex').toUpperCase()}`;

    const orderData: Record<string, any> = {
      customer_name: payload.customerName,
      customer_email: payload.customerEmail,
      customer_phone: payload.customerPhone,
      fulfillment_type: payload.fulfillmentType,
      pricing_model: payload.pricingModel,
      subtotal_amount: subtotalAmount,
      vat_rate: vatRate,
      vat_amount: vatAmount,
      total_amount: totalAmount,
      invoice_number: invoiceNumber,
      invoice_access_token_hash: hashInvoiceAccessToken(invoiceAccessToken),
      status: 'PENDING',
      payment_status: 'UNPAID',
    };

    orderData.delivery_notes = payload.deliveryNotes || null;

    if (payload.fulfillmentType === 'DELIVERY') {
      orderData.delivery_address = payload.deliveryAddress;
      orderData.county = payload.county;
      orderData.courier_service = payload.courierService;
      orderData.shipping_address = payload.deliveryAddress;
    }

    let orderId: string | null = null;
    let rpcError: any = null;

    try {
      const res = await adminSupabase.rpc('create_order_rpc', {
        p_order_data: orderData,
        p_order_items: safeOrderItems,
      });
      orderId = res.data;
      rpcError = res.error;
    } catch (err: any) {
      rpcError = err;
    }

    if (rpcError || !orderId) {
      try {
        const clientSupabase = await createClient();
        const clientRes = await clientSupabase.rpc('create_order_rpc', {
          p_order_data: orderData,
          p_order_items: safeOrderItems,
        });
        if (clientRes.data && !clientRes.error) {
          orderId = clientRes.data;
          rpcError = null;
        } else if (clientRes.error) {
          rpcError = clientRes.error;
        }
      } catch (clientErr: any) {
        rpcError = clientErr;
      }
    }

    if (rpcError || !orderId) {
      logger.error('Failed to create atomic order via RPC', {
        error: rpcError,
        message: rpcError?.message,
        details: rpcError?.details,
        hint: rpcError?.hint,
      });
      const errorMsg = rpcError?.message
        ? `Failed to create order: ${rpcError.message}`
        : 'Failed to create order. Please try again.';
      throw new DatabaseError(errorMsg);
    }

    return {
      id: orderId,
      invoiceNumber,
      invoiceAccessToken,
      subtotalAmount,
      vatRate,
      vatAmount,
      totalAmount,
    };
  }

  /**
   * Fetches a single order with its items and product info — used by invoice API.
   */
  static async getOrderById(id: string) {
    const supabase = await createAdminClient();

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, customers(*)')
      .eq('id', id)
      .single();

    if (error || !order) {
      logger.error(`Failed to fetch order ${id}`, error);
      throw new DatabaseError('Order not found');
    }

    const { data: items } = await supabase
      .from('order_items')
      .select(
        '*, products(name, sku, price, wholesale_price, wholesale_unit, attributes, brands(name))'
      )
      .eq('order_id', id);

    return { ...order, items: items || [] };
  }

  static async getInvoiceAccessHash(id: string) {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('orders')
      .select('id, invoice_access_token_hash')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      logger.error(`Failed to fetch invoice access token for ${id}`, error);
      throw new DatabaseError('Order not found');
    }

    return data;
  }

  /**
   * Fetches all orders for the dashboard, sorted newest first.
   */
  static async getAllOrders() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('orders')
      .select('*, customers(company_name, contact_email)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Failed to fetch all orders', error);
      throw new DatabaseError('Failed to fetch orders');
    }

    return data || [];
  }

  /**
   * Marks an order as WhatsApp sent.
   */
  static async markWhatsAppSent(orderId: string) {
    const supabase = await createClient();
    await supabase
      .from('orders')
      .update({ whatsapp_sent: true })
      .eq('id', orderId);
  }

  /**
   * Updates an order's status.
   */
  static async updateOrderStatus(id: string, status: string) {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select('id, status')
      .single();

    if (error) {
      logger.error(`Failed to update order status ${id}`, error);
      throw new DatabaseError('Failed to update order status');
    }
    return data;
  }

  /**
   * Updates an order's payment status.
   */
  static async updateOrderPaymentStatus(id: string, payment_status: string) {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('orders')
      .update({ payment_status })
      .eq('id', id)
      .select('id, payment_status')
      .single();

    if (error) {
      logger.error(`Failed to update order payment status ${id}`, error);
      throw new DatabaseError('Failed to update order payment status');
    }
    return data;
  }

  /**
   * Soft deletes an order.
   */
  static async deleteOrder(id: string) {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from('orders')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      logger.error(`Failed to delete order with id: ${id}`, error);
      throw new DatabaseError('Database error while deleting order');
    }
    return true;
  }
}
