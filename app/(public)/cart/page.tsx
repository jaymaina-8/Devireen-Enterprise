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
      mapsUrl={settings?.google_maps_url || 'https://www.google.com/maps/place/Devireen+Enterprise./@-1.28181,36.825743,17z/data=!3m1!4b1!4m6!3m5!1s0x182f118fa27150b5:0xe0fb2ec5aa188109!8m2!3d-1.2818154!4d36.8283179!16s%2Fg%2F11nth4f4zs'}
    />
  );
}
