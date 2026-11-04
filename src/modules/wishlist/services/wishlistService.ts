import { supabase } from '../../../lib/supabase';
import type { WishlistItem } from '../../../types';

export interface CreateWishlistItemInput {
  item_name: string;
  is_bought: boolean;
  is_need: boolean;
}

export async function createWishlistItem(
  input: CreateWishlistItemInput,
): Promise<WishlistItem> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user) {
    throw new Error('Sign in before adding a wishlist item.');
  }

  const createdAt = new Date();
  const { data, error } = await supabase
    .from('wishlist_items')
    .insert({
      user_id: user.id,
      item_name: input.item_name,
      is_bought: input.is_bought,
      is_need: input.is_need,
      year: createdAt.getUTCFullYear(),
      month_name: createdAt.toLocaleString('en-US', {
        month: 'long',
        timeZone: 'UTC',
      }),
      day: createdAt.getUTCDate(),
      created_at: createdAt.toISOString(),
    })
    .select('*')
    .single<WishlistItem>();

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error('The wishlist item could not be added.');
  }

  return data;
}

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

export async function getWishlistAccountCreatedAt(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user?.created_at ?? null;
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
