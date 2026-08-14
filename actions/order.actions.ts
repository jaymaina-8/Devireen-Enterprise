'use server';

import {
  OrderRepository,
  CreateOrderPayload,
} from '@/lib/supabase/repositories/order.repository';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminServerAction } from '@/lib/auth/authorization';
import { createSafeAction } from '@/lib/actions/withErrorHandling';

/**
 * Generates a unique, human-readable invoice number.
 */
export const generateInvoiceNumberAction = createSafeAction(
  'generateInvoiceNumberAction',
  async (): Promise<string> => {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const supabase = await createClient();
    const { count } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .like('invoice_number', `INV-${dateStr}-%`);

    const seq = 1000 + (count || 0) + Math.floor(Math.random() * 100);
    return `INV-${dateStr}-${seq}`;
  }
);

/**
 * Creates a public order from the checkout flow.
 * No authentication required — this is for guest customers.
 */
export const createPublicOrderAction = createSafeAction(
  'createPublicOrderAction',
  async (payload: CreateOrderPayload) => {
    if (!payload.items || payload.items.length === 0) {
      throw new Error('Cart is empty. Please add items before ordering.');
    }
    if (!payload.totalAmount || payload.totalAmount <= 0) {
      throw new Error('Invalid order total.');
    }

    const order = await OrderRepository.createOrder(payload);
    revalidatePath('/dashboard/orders');
    return { orderId: order.id };
  }
);

/**
 * Fetches a single order by ID (for invoice generation and order confirmation).
 */
export const fetchOrderByIdAction = createSafeAction(
  'fetchOrderByIdAction',
  async (orderId: string) => {
    await verifyAdminServerAction();
    return await OrderRepository.getOrderById(orderId);
  }
);

/**
 * Marks an order's WhatsApp status as sent.
 */
export const markOrderWhatsAppSentAction = createSafeAction(
  'markOrderWhatsAppSentAction',
  async (orderId: string) => {
    await verifyAdminServerAction();
    await OrderRepository.markWhatsAppSent(orderId);
    revalidatePath('/dashboard/orders');
    return true;
  }
);

/**
 * Updates an order's status (e.g. PENDING -> SHIPPED).
 */
export const updateOrderStatusAction = createSafeAction(
  'updateOrderStatusAction',
  async (orderId: string, status: string) => {
    await verifyAdminServerAction();
    const order = await OrderRepository.updateOrderStatus(orderId, status);
    revalidatePath('/dashboard/orders');
    return order;
  }
);

/**
 * Updates an order's payment status (e.g. UNPAID -> PAID).
 */
export const updateOrderPaymentStatusAction = createSafeAction(
  'updateOrderPaymentStatusAction',
  async (orderId: string, paymentStatus: string) => {
    await verifyAdminServerAction();
    const order = await OrderRepository.updateOrderPaymentStatus(
      orderId,
      paymentStatus
    );
    revalidatePath('/dashboard/orders');
    return order;
  }
);
