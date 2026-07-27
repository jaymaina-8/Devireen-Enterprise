import { Metadata } from 'next';
import { SettingsRepository } from '@/lib/supabase/repositories/settings.repository';
import { CheckoutPage } from './CheckoutPage';

export const metadata: Metadata = {
  title: 'Cart & Checkout | Devireen Enterprise',
  description: 'Review your order, choose delivery or pickup, and download your invoice.',
  robots: { index: false, follow: false },
};

export default async function CartPage() {
  // Fetch settings server-side so we can pass shop info to the client
  const settings = await SettingsRepository.getSettings();

  return (
    <CheckoutPage
      whatsappNumber={settings?.whatsapp_number || '254708037929'}
      shopAddress={settings?.physical_address || ''}
      mapsUrl={settings?.google_maps_url || ''}
    />
  );
}
