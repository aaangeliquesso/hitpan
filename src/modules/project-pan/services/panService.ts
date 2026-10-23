import { supabase } from '../../../lib/supabase';
import type { VanityItem } from '../../../types';

export async function getPanItems(): Promise<VanityItem[]> {
  const { data, error } = await supabase
    .from('vanity_items')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<VanityItem[]>();

  if (error) {
    throw error;
  }

  return data;
}

export async function getPanItemById(id: string): Promise<VanityItem> {
  const { data, error } = await supabase
    .from('vanity_items')
    .select('*')
    .eq('id', id)
    .maybeSingle<VanityItem>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error('This product could not be found.');
  }

  return data;
}

export async function updatePanItemRating(
  id: string,
  rating: number,
): Promise<void> {
  const { error } = await supabase
    .from('vanity_items')
    .update({ rating })
    .eq('id', id);

  if (error) {
    throw error;
  }
}
