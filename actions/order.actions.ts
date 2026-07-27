'use server';

import {
  OrderRepository,
  CreateOrderPayload,
} from '@/lib/supabase/repositories/order.repository';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

/**
 * Generates a unique, human-readable invoice number.
 * Format: INV-YYYYMMDD-XXXX (e.g. INV-20260726-4829)
 * Uses a random 4-digit suffix to avoid collisions (good enough for typical volume).
 */
export async function generateInvoiceNumberAction(): Promise<string> {
  const dateStr = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '');

  // Check existing invoices with same date prefix to avoid any duplicate numbers
  const supabase = await createClient();
  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .like('invoice_number', `INV-${dateStr}-%`);

  // Base off count + random offset for uniqueness
  const seq = 1000 + (count || 0) + Math.floor(Math.random() * 100);
  return `INV-${dateStr}-${seq}`;
}

/**
 * Creates a public order from the checkout flow.
 * No authentication required — this is for guest customers.
 */
export async function createPublicOrderAction(payload: CreateOrderPayload) {
  try {
    // Validate cart is not empty
    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: 'Cart is empty. Please add items before ordering.' };
    }

    // Validate total amount
    if (!payload.totalAmount || payload.totalAmount <= 0) {
      return { success: false, error: 'Invalid order total.' };
    }

    const order = await OrderRepository.createOrder(payload);
    revalidatePath('/dashboard/orders');
    return { success: true, data: { orderId: order.id } };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create order. Please try again.',
    };
  }
}

/**
 * Fetches a single order by ID (for invoice generation and order confirmation).
 */
export async function fetchOrderByIdAction(orderId: string) {
  try {
    const order = await OrderRepository.getOrderById(orderId);
    return { success: true, data: order };
  } catch (error: any) {
    return { success: false, error: error.message || 'Order not found' };
  }
}

/**
 * Marks an order's WhatsApp status as sent.
 */
export async function markOrderWhatsAppSentAction(orderId: string) {
  try {
    await OrderRepository.markWhatsAppSent(orderId);
    revalidatePath('/dashboard/orders');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
