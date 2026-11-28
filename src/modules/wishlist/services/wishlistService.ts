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

export async function getWishlistPage(
  offset: number,
  pageSize: number,
  year: number | null,
  month: number | null,
): Promise<WishlistItem[]> {
  let query = supabase
    .from('wishlist_items')
    .select('*');

  if (year !== null) {
    const start = new Date(Date.UTC(year, month ?? 0, 1)).toISOString();
    const end = new Date(
      Date.UTC(year, month === null ? 12 : month + 1, 1),
    ).toISOString();
    query = query.gte('created_at', start).lt('created_at', end);
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1)
    .returns<WishlistItem[]>();

  if (error) {
    throw error;
  }

  return data;
}

export async function getWishlistItemsForYear(
  year: number,
): Promise<WishlistItem[]> {
  const pageSize = 500;
  const items: WishlistItem[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const page = await getWishlistPage(offset, pageSize, year, null);
    items.push(...page);
    if (page.length < pageSize) {
      return items;
    }
  }
}

export async function getWishlistMonthsWithItems(
  year: number,
): Promise<number[]> {
  const monthResults = await Promise.all(
    Array.from({ length: 12 }, async (_, month) => {
      const start = new Date(Date.UTC(year, month, 1)).toISOString();
      const end = new Date(Date.UTC(year, month + 1, 1)).toISOString();
      const { count, error } = await supabase
        .from('wishlist_items')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', start)
        .lt('created_at', end);

      if (error) {
        throw error;
      }

      return count ? month : null;
    }),
  );

  return monthResults.filter((month): month is number => month !== null);
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
