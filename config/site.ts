import { env } from '@/lib/env';

export const siteConfig = {
  name: env.COMPANY_NAME || 'Devireen Enterprise',
  description:
    'Leading B2B supplier of premium hospitality supplies, uniforms, and corporate gifting in Nairobi, Kenya.',
  url: env.NEXT_PUBLIC_SITE_URL || 'https://www.devireenenterprise.com',
  links: {
    whatsapp: env.WHATSAPP_NUMBER || '',
  },
  defaultCurrency: 'KES',
};

export type SiteConfig = typeof siteConfig;
