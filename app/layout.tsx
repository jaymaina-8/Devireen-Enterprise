import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { siteConfig } from '@/config/site';
import { Toaster } from '@/components/ui/Toaster';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

import { SettingsRepository } from '@/lib/supabase/repositories/settings.repository';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = (await SettingsRepository.getSettings()) || {};
  const baseUrl = siteConfig.url || 'https://www.devireenenterprise.com';
  return {
    metadataBase: new URL(baseUrl),
    title: {
      default:
        settings.default_seo_title ||
        'Office Supplies, Stationery & School Essentials | Devireen Enterprise',
      template: `%s | ${settings.company_name || siteConfig.name}`,
    },
    description: settings.default_seo_description || siteConfig.description,
    keywords: [
      'stationery',
      'office supplies',
      'school accessories',
      'books',
      'educational supplies',
      'bulk office supplies',
      'Nairobi stationery supplier',
      'Kenya business supplies',
      'Devireen Enterprise',
    ],
    alternates: {
      canonical: '/',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', type: 'image/png' },
        { url: '/favicon.png', type: 'image/png' },
        { url: '/images/google-logo.png', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
      apple: [{ url: '/apple-icon.png', type: 'image/png' }],
    },
    openGraph: {
      type: 'website',
      locale: 'en_KE',
      url: baseUrl,
      siteName: settings.company_name || siteConfig.name,
      title:
        settings.default_seo_title ||
        'Office Supplies, Stationery & School Essentials | Devireen Enterprise',
      description: settings.default_seo_description || siteConfig.description,
      images: [
        {
          url: `${baseUrl}/images/devireen-logo.png`,
          width: 1080,
          height: 1080,
          alt: 'Devireen Enterprise Logo',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title:
        settings.default_seo_title ||
        'Office Supplies, Stationery & School Essentials | Devireen Enterprise',
      description: settings.default_seo_description || siteConfig.description,
      images: [`${baseUrl}/images/devireen-logo.png`],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = (await SettingsRepository.getSettings()) || {};

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full max-w-full overflow-x-hidden antialiased`}
      suppressHydrationWarning
    >
      <body
        className="bg-background text-text-body flex min-h-full max-w-full flex-col overflow-x-hidden font-sans"
        suppressHydrationWarning
      >
        {children}
        <ScrollToTop />
        <Toaster />
      </body>
    </html>
  );
}
