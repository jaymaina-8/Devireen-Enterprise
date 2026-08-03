export const siteConfig = {
  name: process.env.NEXT_PUBLIC_COMPANY_NAME || 'Devireen Enterprise',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.devireenenterprise.com',
  description:
    'Modern B2B-first procurement platform for office supplies and stationery.',
  contact: {
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
    maps: process.env.NEXT_PUBLIC_GOOGLE_MAPS || '',
  },
};

export type SiteConfig = typeof siteConfig;
