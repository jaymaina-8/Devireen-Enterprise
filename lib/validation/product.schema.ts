import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z.string().optional(),
  category_ids: z.array(z.string().uuid('Invalid category ID')).optional(),
  is_all_categories: z.boolean().default(false),
  brand_id: z.string().uuid('Invalid brand ID').optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  sale_price: z.number().min(0).optional().nullable(),
  stock_status: z
    .enum(['IN_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER', 'DISCONTINUED'])
    .default('IN_STOCK'),
  is_active: z.boolean().default(true),
  show_in_retail: z.boolean().default(true),
  show_in_wholesale: z.boolean().default(true),
});

export type ProductInput = z.infer<typeof productSchema>;
