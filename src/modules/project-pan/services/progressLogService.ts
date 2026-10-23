import { supabase } from '../../../lib/supabase';
import type { ProgressLog } from '../../../types';

export async function getProgressLogs(
  vanityItemId?: string,
): Promise<ProgressLog[]> {
  let query = supabase
    .from('progress_logs')
    .select('*')
    .order('logged_at', { ascending: false });

  if (vanityItemId) {
    query = query.eq('vanity_item_id', vanityItemId);
  }

  const { data, error } = await query.returns<ProgressLog[]>();

  if (error) {
    throw error;
  }

  return data;
}
