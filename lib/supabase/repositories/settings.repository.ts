import { cache } from 'react';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import { DatabaseError } from '@/lib/errors/DatabaseError';
import { logger } from '@/lib/logger';

export class SettingsRepository {
  static getSettings = cache(async () => {
    try {
      let data: any = null;

      // Try admin client first to allow server-side reading of public metadata
      try {
        const adminSupabase = await createAdminClient();
        const { data: adminData, error } = await adminSupabase
          .from('settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (!error && adminData) {
          data = adminData;
        }
      } catch {
        // Fallback to standard client
      }

      if (!data) {
        const supabase = await createClient();
        const { data: clientData, error } = await supabase
          .from('settings')
          .select('*')
          .limit(1)
          .maybeSingle();

        if (error) {
          throw new DatabaseError('Failed to fetch settings');
        }
        data = clientData;
      }

      if (data) {
        const businessHours =
          typeof data.business_hours === 'object' &&
          data.business_hours !== null
            ? data.business_hours
            : {};

        const extraConfig =
          typeof data.social_media_links === 'object' &&
          data.social_media_links !== null
            ? data.social_media_links
            : {};

        return {
          ...data,
          kra_pin: data.kra_pin || extraConfig.kra_pin || '',
          vat_rate:
            data.vat_rate != null
              ? Number(data.vat_rate)
              : extraConfig.vat_rate != null
                ? Number(extraConfig.vat_rate)
                : 16,
          enable_vat:
            data.enable_vat != null
              ? data.enable_vat
              : extraConfig.enable_vat != null
                ? extraConfig.enable_vat
                : true,
          business_hours_weekdays:
            data.business_hours_weekdays ||
            businessHours.weekdays ||
            '8:00 AM - 5:00 PM',
          business_hours_weekends:
            data.business_hours_weekends ||
            businessHours.weekends ||
            '8:30 AM - 1:00 PM (Sat), Closed (Sun)',
        };
      }

      return null;
    } catch (error: any) {
      if (
        error?.digest === 'DYNAMIC_SERVER_USAGE' ||
        error?.message === 'NEXT_REDIRECT' ||
        error?.message === 'NEXT_NOT_FOUND'
      ) {
        throw error;
      }
      logger.error('Error fetching settings', error);
      return null;
    }
  });

  static async updateSettings(settingsData: any) {
    try {
      const adminSupabase = await createAdminClient();

      const { data: existing, error: fetchErr } = await adminSupabase
        .from('settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (fetchErr) {
        logger.warn('Failed to query existing settings row', fetchErr);
      }

      const availableColumns = new Set(
        existing && typeof existing === 'object'
          ? Object.keys(existing)
          : [
              'company_name',
              'logo_url',
              'favicon_url',
              'phone_numbers',
              'whatsapp_number',
              'email',
              'physical_address',
              'branches',
              'business_hours',
              'google_maps_url',
              'social_media_links',
              'footer_content',
              'default_seo_title',
              'default_seo_description',
              'default_og_image',
            ]
      );

      const {
        business_hours_weekdays,
        business_hours_weekends,
        kra_pin,
        vat_rate,
        enable_vat,
        ...restFields
      } = settingsData;

      // Existing social media links / extra config container fallback
      const existingSocial =
        existing &&
        typeof existing.social_media_links === 'object' &&
        existing.social_media_links !== null
          ? existing.social_media_links
          : {};

      // Raw merged payload
      const candidatePayload: Record<string, any> = {
        ...restFields,
        kra_pin,
        vat_rate,
        enable_vat,
        business_hours_weekdays,
        business_hours_weekends,
        business_hours: {
          weekdays: business_hours_weekdays || '8:00 AM - 5:00 PM',
          weekends:
            business_hours_weekends || '8:30 AM - 1:00 PM (Sat), Closed (Sun)',
        },
        social_media_links: {
          ...existingSocial,
          kra_pin,
          vat_rate,
          enable_vat,
        },
      };

      // Filter payload strictly to columns that exist in the database table
      const filteredPayload: Record<string, any> = {};
      for (const [key, val] of Object.entries(candidatePayload)) {
        if (availableColumns.has(key)) {
          filteredPayload[key] = val;
        }
      }

      let error;
      if (existing?.id) {
        const { error: updateError } = await adminSupabase
          .from('settings')
          .update(filteredPayload)
          .eq('id', existing.id);
        error = updateError;
      } else {
        const { error: insertError } = await adminSupabase
          .from('settings')
          .insert([filteredPayload]);
        error = insertError;
      }

      if (error) {
        logger.error('Database error updating settings', error);
        throw new DatabaseError(`Failed to update settings: ${error.message}`);
      }

      return true;
    } catch (error) {
      logger.error('Error updating settings', error);
      throw error;
    }
  }
}
