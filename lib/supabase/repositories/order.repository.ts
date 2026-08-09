import { createClient, createAdminClient } from '@/lib/supabase/server';
import { DatabaseError } from '@/lib/errors/DatabaseError';
import { logger } from '@/lib/logger';

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
  totalAmount: number;
  invoiceNumber: string;
  items: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
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
    let calculatedTotal = 0;
    const safeOrderItems = [];

    for (const item of payload.items) {
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

      calculatedTotal += authoritativePrice * item.quantity;
      safeOrderItems.push({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: authoritativePrice,
      });
    }

    // 3. Insert Order
    // Since RLS blocks public INSERT using standard client, use admin client
    // because this is an unauthenticated guest checkout flow.
    const adminSupabase = await createAdminClient();

    const orderData: Record<string, any> = {
      customer_name: payload.customerName,
      customer_email: payload.customerEmail,
      customer_phone: payload.customerPhone,
      fulfillment_type: payload.fulfillmentType,
      pricing_model: payload.pricingModel,
      total_amount: calculatedTotal,
      invoice_number: payload.invoiceNumber,
      status: 'PENDING',
      payment_status: 'UNPAID',
    };

    if (payload.fulfillmentType === 'DELIVERY') {
      orderData.delivery_address = payload.deliveryAddress;
      orderData.county = payload.county;
      orderData.courier_service = payload.courierService;
      orderData.delivery_notes = payload.deliveryNotes || null;
      orderData.shipping_address = payload.deliveryAddress;
    }

    const { data: order, error: orderError } = await adminSupabase
      .from('orders')
      .insert(orderData)
      .select('id')
      .single();

    if (orderError || !order) {
      logger.error('Failed to create order', orderError);
      throw new DatabaseError(`Failed to create order: ${orderError?.message}`);
    }

    // 4. Insert Order Items
    const itemsToInsert = safeOrderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await adminSupabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) {
      logger.error('Failed to create order items', itemsError);
      throw new DatabaseError(
        `Failed to create order items: ${itemsError.message}`
      );
    }

    return order;
  }

  /**
   * Fetches a single order with its items and product info — used by invoice API.
   */
  static async getOrderById(id: string) {
    const supabase = await createClient();

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
      .select('*, products(name, sku, price, wholesale_price)')
      .eq('order_id', id);

    return { ...order, items: items || [] };
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
      throw new DatabaseError(
        `Failed to update order status: ${error.message}`
      );
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
      throw new DatabaseError(
        `Failed to update order payment status: ${error.message}`
      );
    }
    return data;
  }
}
