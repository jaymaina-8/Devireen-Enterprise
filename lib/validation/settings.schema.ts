import { z } from 'zod';

export const settingsSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  logo_url: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || ''),
  favicon_url: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || ''),
  phone_numbers: z
    .array(z.string())
    .optional()
    .nullable()
    .transform((val) => val || []),
  whatsapp_number: z
    .string()
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || ''),
  email: z
    .string()
    .email()
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || ''),
  physical_address: z
    .string()
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || ''),
  google_maps_url: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || ''),
  footer_content: z
    .string()
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || ''),
  default_seo_title: z
    .string()
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || ''),
  default_seo_description: z
    .string()
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || ''),
  default_og_image: z
    .string()
    .url()
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || ''),
  kra_pin: z
    .string()
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || ''),
  vat_rate: z.coerce.number().optional().nullable(),
  enable_vat: z.boolean().default(true).optional().nullable(),
  business_hours_weekdays: z
    .string()
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || ''),
  business_hours_weekends: z
    .string()
    .optional()
    .or(z.literal(''))
    .nullable()
    .transform((val) => val || ''),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
