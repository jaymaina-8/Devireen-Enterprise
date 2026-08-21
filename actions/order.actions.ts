'use server';

import {
  OrderRepository,
  CreateOrderPayload,
} from '@/lib/supabase/repositories/order.repository';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminServerAction } from '@/lib/auth/authorization';
import { createSafeAction } from '@/lib/actions/withErrorHandling';

import { rateLimit, getClientIp } from '@/lib/rate-limit';

/**
 * Creates a public order from the checkout flow.
 * No authentication required — this is for guest customers.
 */
export const createPublicOrderAction = createSafeAction(
  'createPublicOrderAction',
  async (payload: CreateOrderPayload) => {
    const ip = await getClientIp();
    const rateLimitResult = await rateLimit(ip, 'ORDER_CREATE');
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }

    if (!payload.items || payload.items.length === 0) {
      throw new Error('Cart is empty. Please add items before ordering.');
    }
    const order = await OrderRepository.createOrder(payload);
    revalidatePath('/dashboard/orders');
    return {
      orderId: order.id,
      invoiceNumber: order.invoiceNumber,
      invoiceAccessToken: order.invoiceAccessToken,
      subtotalAmount: order.subtotalAmount,
      vatRate: order.vatRate,
      vatAmount: order.vatAmount,
      totalAmount: order.totalAmount,
    };
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
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
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
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
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
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    const order = await OrderRepository.updateOrderPaymentStatus(
      orderId,
      paymentStatus
    );
    revalidatePath('/dashboard/orders');
    return order;
  }
);

/**
 * Deletes an order (soft delete).
 */
export const deleteOrderAction = createSafeAction(
  'deleteOrderAction',
  async (orderId: string) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    await OrderRepository.deleteOrder(orderId);
    revalidatePath('/dashboard/orders');
    revalidatePath('/dashboard');
    return true;
  }
);
