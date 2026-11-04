import { useCallback, useEffect, useState } from 'react';
import {
  createWishlistItem,
  getWishlistAccountCreatedAt,
  getWishlist,
  updateWishlistItem,
} from '../services/wishlistService';
import type { WishlistItem } from '../../../types';
import type { CreateWishlistItemInput } from '../services/wishlistService';
import { sortWishlistByCreatedAt } from '../years';

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [accountCreatedAt, setAccountCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [savingIds, setSavingIds] = useState<Set<string>>(() => new Set());

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [wishlist, accountCreationDate] = await Promise.all([
        getWishlist(),
        getWishlistAccountCreatedAt(),
      ]);
      setItems(sortWishlistByCreatedAt(wishlist));
      setAccountCreatedAt(accountCreationDate);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause : new Error('Unable to load wishlist.'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const updateItem = useCallback(
    async (id: string, update: Partial<Pick<WishlistItem, 'is_bought' | 'is_need'>>) => {
      const previousItem = items.find((item) => item.id === id);
      if (!previousItem || savingIds.has(id)) {
        return;
      }

      setSavingIds((current) => new Set(current).add(id));
      setError(null);
      setItems((current) =>
        current.map((item) => (item.id === id ? { ...item, ...update } : item)),
      );

      try {
        await updateWishlistItem(id, update);
      } catch (cause) {
        setItems((current) =>
          current.map((item) => (item.id === id ? previousItem : item)),
        );
        setError(
          cause instanceof Error
            ? cause
            : new Error('Unable to update this wishlist item.'),
        );
      } finally {
        setSavingIds((current) => {
          const next = new Set(current);
          next.delete(id);
          return next;
        });
      }
    },
    [items, savingIds],
  );

  const addItem = useCallback(async (input: CreateWishlistItemInput) => {
    setError(null);
    const item = await createWishlistItem(input);
    setItems((current) => sortWishlistByCreatedAt([item, ...current]));
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    items,
    accountCreatedAt,
    loading,
    error,
    refresh,
    addItem,
    updateItem,
    savingIds,
  };
}
