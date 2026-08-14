'use server';

import { SettingsRepository } from '@/lib/supabase/repositories/settings.repository';
import { settingsSchema } from '@/lib/validation/settings.schema';
import { revalidatePath } from 'next/cache';
import { verifyAdminServerAction } from '@/lib/auth/authorization';
import { createSafeAction } from '@/lib/actions/withErrorHandling';

export const updateSettingsAction = createSafeAction(
  'updateSettingsAction',
  async (formData: FormData) => {
    await verifyAdminServerAction();
    const rawData = {
      company_name: formData.get('company_name'),
      email: formData.get('email'),
      phone_numbers: formData.get('phone_numbers')
        ? [formData.get('phone_numbers')]
        : [],
      whatsapp_number: formData.get('whatsapp_number'),
      physical_address: formData.get('physical_address'),
      google_maps_url: formData.get('google_maps_url'),
      footer_content: formData.get('footer_content'),
      default_seo_title: formData.get('default_seo_title'),
      default_seo_description: formData.get('default_seo_description'),
      kra_pin: formData.get('kra_pin'),
      vat_rate: formData.get('vat_rate'),
      enable_vat: formData.get('enable_vat') === 'on',
      business_hours_weekdays: formData.get('business_hours_weekdays'),
      business_hours_weekends: formData.get('business_hours_weekends'),
    };

    const validatedData = settingsSchema.parse(rawData);

    await SettingsRepository.updateSettings(validatedData);

    revalidatePath('/', 'layout'); // Revalidate everything
    return true;
  }
);

export const fetchSettingsAction = createSafeAction(
  'fetchSettingsAction',
  async () => {
    return await SettingsRepository.getSettings();
  }
);
