import { z } from 'zod';

const quoteItemSchema = z.object({
  product_id: z.string().uuid('Invalid product ID'),
  quantity: z.coerce.number().int().min(1).max(10_000),
  unit_price: z.coerce.number().finite().min(0).max(99_999_999.99),
});

export const adminQuoteSchema = z.object({
  customer_id: z.string().uuid('Invalid customer ID'),
  status: z.enum(['DRAFT', 'PENDING', 'REVIEWING', 'APPROVED', 'REJECTED']),
  notes: z.string().trim().max(5_000).nullable().optional(),
  items: z.array(quoteItemSchema).min(1).max(100),
});

export type AdminQuoteInput = z.infer<typeof adminQuoteSchema>;
