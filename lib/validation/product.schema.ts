import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  sku: z.string().min(1, 'SKU is required'),
  description: z
    .string()
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || ''),
  short_description: z
    .string()
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || ''),
  category_ids: z
    .array(z.string().uuid('Invalid category ID'))
    .optional()
    .default([]),
  is_all_categories: z.boolean().default(false),
  brand_id: z
    .string()
    .uuid('Invalid brand ID')
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => (val ? val : null)),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  sale_price: z.coerce
    .number()
    .min(0)
    .optional()
    .nullable()
    .transform((val) => (val && val > 0 ? val : null)),
  wholesale_price: z.coerce
    .number()
    .min(0)
    .optional()
    .nullable()
    .transform((val) => (val && val > 0 ? val : null)),
  wholesale_unit: z.string().optional().nullable().default('Dozen'),
  stock_status: z
    .enum(['IN_STOCK', 'OUT_OF_STOCK', 'PRE_ORDER', 'DISCONTINUED'])
    .default('IN_STOCK'),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  show_in_retail: z.boolean().default(true),
  show_in_wholesale: z.boolean().default(true),
  attributes: z.record(z.string(), z.any()).optional().default({}),
});

export type ProductInput = z.infer<typeof productSchema>;
