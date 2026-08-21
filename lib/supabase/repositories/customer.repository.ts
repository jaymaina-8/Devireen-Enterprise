import { createClient } from '@/lib/supabase/server';
import { DatabaseError } from '@/lib/errors/DatabaseError';
import { logger } from '@/lib/logger';

export class CustomerRepository {
  static async getAllCustomers() {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .is('deleted_at', null)
      .order('company_name', { ascending: true });

    if (error) {
      logger.error('Failed to fetch customers', error);
      throw new DatabaseError('Failed to fetch customers');
    }

    return data || [];
  }

  static async getCustomerById(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      logger.error(`Failed to fetch customer ${id}`, error);
      throw new DatabaseError('Failed to fetch customer');
    }

    return data;
  }
}
