'use server';

import { SettingsRepository } from '@/lib/supabase/repositories/settings.repository';
import { settingsSchema } from '@/lib/validation/settings.schema';
import { revalidatePath } from 'next/cache';
import { verifyAdminServerAction } from '@/lib/auth/authorization';
import { createSafeAction } from '@/lib/actions/withErrorHandling';
import { rateLimit } from '@/lib/rate-limit';

export const updateSettingsAction = createSafeAction(
  'updateSettingsAction',
  async (formData: FormData) => {
    const user = await verifyAdminServerAction();
    const rateLimitResult = await rateLimit(
      `admin:${user.id}`,
      'ADMIN_MUTATION'
    );
    if (!rateLimitResult.success) {
      throw new Error('Too many requests. Please try again later.');
    }
    const existing = (await SettingsRepository.getSettings()) || {};

    const rawPhones = formData.get('phone_numbers');
    let parsedPhoneNumbers: string[] = existing.phone_numbers || [];
    if (typeof rawPhones === 'string' && rawPhones.trim()) {
      parsedPhoneNumbers = rawPhones
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean);
    }

    const rawData = {
      company_name:
        formData.get('company_name') ||
        existing.company_name ||
        'Devireen Enterprise',
      email:
        formData.get('email') !== null
          ? formData.get('email')
          : (existing.email ?? ''),
      phone_numbers: parsedPhoneNumbers,
      whatsapp_number:
        formData.get('whatsapp_number') !== null
          ? formData.get('whatsapp_number')
          : (existing.whatsapp_number ?? ''),
      physical_address:
        formData.get('physical_address') !== null
          ? formData.get('physical_address')
          : (existing.physical_address ?? ''),
      google_maps_url:
        formData.get('google_maps_url') !== null
          ? formData.get('google_maps_url')
          : (existing.google_maps_url ?? ''),
      footer_content:
        formData.get('footer_content') !== null
          ? formData.get('footer_content')
          : (existing.footer_content ?? ''),
      default_seo_title:
        formData.get('default_seo_title') !== null
          ? formData.get('default_seo_title')
          : (existing.default_seo_title ?? ''),
      default_seo_description:
        formData.get('default_seo_description') !== null
          ? formData.get('default_seo_description')
          : (existing.default_seo_description ?? ''),
      kra_pin:
        formData.get('kra_pin') !== null
          ? formData.get('kra_pin')
          : (existing.kra_pin ?? ''),
      vat_rate: formData.get('vat_rate')
        ? Number(formData.get('vat_rate'))
        : (existing.vat_rate ?? 16),
      enable_vat: formData.has('enable_vat')
        ? formData.get('enable_vat') === 'on' ||
          formData.get('enable_vat') === 'true'
        : existing.enable_vat !== false,
      business_hours_weekdays:
        formData.get('business_hours_weekdays') !== null
          ? formData.get('business_hours_weekdays')
          : (existing.business_hours_weekdays ?? ''),
      business_hours_weekends:
        formData.get('business_hours_weekends') !== null
          ? formData.get('business_hours_weekends')
          : (existing.business_hours_weekends ?? ''),
    };

    const validatedData = settingsSchema.parse(rawData);

    await SettingsRepository.updateSettings(validatedData);

    revalidatePath('/', 'layout'); // Revalidate all cached pages
    return true;
  }
);

export const fetchSettingsAction = createSafeAction(
  'fetchSettingsAction',
  async () => {
    return await SettingsRepository.getSettings();
  }
);
