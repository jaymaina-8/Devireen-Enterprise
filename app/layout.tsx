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
    title: {
      default: settings.default_seo_title || siteConfig.name,
      template: `%s | ${settings.company_name || siteConfig.name}`,
    },
    description: settings.default_seo_description || siteConfig.description,
    icons: {
      icon: '/images/google logo.png',
      shortcut: '/images/google logo.png',
      apple: '/images/google logo.png',
    },
    openGraph: {
      type: 'website',
      locale: 'en_KE',
      url: baseUrl,
      siteName: settings.company_name || siteConfig.name,
      title: settings.default_seo_title || siteConfig.name,
      description: settings.default_seo_description || siteConfig.description,
      images: [
        {
          url: `${baseUrl}/images/google%20logo.png`,
          width: 1080,
          height: 1080,
          alt: 'Devireen Enterprise Logo',
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: settings.default_seo_title || siteConfig.name,
      description: settings.default_seo_description || siteConfig.description,
      images: [`${baseUrl}/images/google%20logo.png`],
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
