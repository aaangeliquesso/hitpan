import { supabase } from '../../../lib/supabase';
import type { WishlistItem } from '../../../types';

export async function getWishlist(): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from('wishlist_items')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<WishlistItem[]>();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateWishlistItem(
  id: string,
  update: Partial<Pick<WishlistItem, 'is_bought' | 'is_need'>>,
): Promise<void> {
  const { error } = await supabase
    .from('wishlist_items')
    .update(update)
    .eq('id', id);

  if (error) {
    throw error;
  }
}
