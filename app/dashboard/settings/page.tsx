import { SettingsRepository } from '@/lib/supabase/repositories/settings.repository';
import { SettingsForm } from '@/components/dashboard/settings/SettingsForm';
import { Settings } from 'lucide-react';

export const metadata = {
  title: 'Enterprise Settings | Devireen Enterprise OS',
};

export default async function SettingsPage() {
  const dbSettings = await SettingsRepository.getSettings();
  const settings = {
    company_name: 'Devireen Enterprise',
    email: 'sales@devireenenterprise.com',
    phone_numbers: ['+254 708 037 929'],
    whatsapp_number: '+254 708 037 929',
    physical_address: 'Enterprise Road, Industrial Area, Nairobi, Kenya',
    vat_rate: 16,
    enable_vat: true,
    business_hours_weekdays: '8:00 AM - 5:00 PM',
    business_hours_weekends: '8:30 AM - 1:00 PM (Sat), Closed (Sun)',
    footer_content:
      'Quotes valid for 30 days. Payment terms 50% deposit, balance on delivery.',
    ...dbSettings,
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
          <Settings className="h-6 w-6 text-slate-700" /> Enterprise Operations
          Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Configure company profiles, KRA tax credentials, operating hours, and
          quotation defaults.
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
