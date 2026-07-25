import { cache } from 'react';
import { createClient } from '@/lib/supabase/server';
import { DatabaseError } from '@/lib/errors/DatabaseError';
import { logger } from '@/lib/logger';

export class SettingsRepository {
  static getSettings = cache(async () => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new DatabaseError('Failed to fetch settings');
      }

      return data;
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
      const supabase = await createClient();

      const { data: existing } = await supabase
        .from('settings')
        .select('id')
        .limit(1)
        .maybeSingle();

      let error;
      if (existing) {
        const { error: updateError } = await supabase
          .from('settings')
          .update(settingsData)
          .eq('id', existing.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('settings')
          .insert([settingsData]);
        error = insertError;
      }

      if (error) {
        throw new DatabaseError('Failed to update settings');
      }

      return true;
    } catch (error) {
      logger.error('Error updating settings', error);
      throw error;
    }
  }
}
