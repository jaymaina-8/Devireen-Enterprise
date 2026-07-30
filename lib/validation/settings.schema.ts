import { z } from 'zod';

export const settingsSchema = z.object({
  company_name: z.string().min(1, 'Company name is required'),
  logo_url: z.string().url().optional().or(z.literal('')),
  favicon_url: z.string().url().optional().or(z.literal('')),
  phone_numbers: z.array(z.string()).optional(),
  whatsapp_number: z.string().optional().or(z.literal('')),
  email: z.string().email().optional().or(z.literal('')),
  physical_address: z.string().optional().or(z.literal('')),
  google_maps_url: z.string().url().optional().or(z.literal('')),
  footer_content: z.string().optional().or(z.literal('')),
  default_seo_title: z.string().optional().or(z.literal('')),
  default_seo_description: z.string().optional().or(z.literal('')),
  default_og_image: z.string().url().optional().or(z.literal('')),
  kra_pin: z.string().optional().or(z.literal('')),
  vat_rate: z.coerce.number().optional(),
  enable_vat: z.boolean().default(true).optional(),
  business_hours_weekdays: z.string().optional().or(z.literal('')),
  business_hours_weekends: z.string().optional().or(z.literal('')),
});

export type SettingsFormData = z.infer<typeof settingsSchema>;
