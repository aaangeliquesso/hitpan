import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createWishlistItem,
  getWishlistAccountCreatedAt,
  getWishlistPage,
  updateWishlistItem,
} from '../services/wishlistService';
import type { WishlistItem } from '../../../types';
import type { CreateWishlistItemInput } from '../services/wishlistService';
import { sortWishlistByCreatedAt } from '../years';

const WISHLIST_PAGE_SIZE = 50;

export function useWishlist(selectedYear: number | null) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [accountCreatedAt, setAccountCreatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [savingIds, setSavingIds] = useState<Set<string>>(() => new Set());
  const offsetRef = useRef(0);
  const requestIdRef = useRef(0);
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    offsetRef.current = 0;
    hasMoreRef.current = true;
    loadingMoreRef.current = false;
    setItems([]);
    setHasMore(true);
    setLoadingMore(false);
    setLoading(true);
    setError(null);

    try {
      const [page, accountCreationDate] = await Promise.all([
        getWishlistPage(0, WISHLIST_PAGE_SIZE, selectedYear),
        getWishlistAccountCreatedAt(),
      ]);
      if (requestId !== requestIdRef.current) return;

      setItems(sortWishlistByCreatedAt(page));
      setAccountCreatedAt(accountCreationDate);
      offsetRef.current = page.length;
      hasMoreRef.current = page.length === WISHLIST_PAGE_SIZE;
      setHasMore(hasMoreRef.current);
    } catch (cause) {
      if (requestId === requestIdRef.current) {
        setError(
          cause instanceof Error ? cause : new Error('Unable to load wishlist.'),
        );
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [selectedYear]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMoreRef.current || !hasMoreRef.current) return;

    const requestId = requestIdRef.current;
    const offset = offsetRef.current;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setError(null);

    try {
      const page = await getWishlistPage(
        offset,
        WISHLIST_PAGE_SIZE,
        selectedYear,
      );
      if (requestId !== requestIdRef.current) return;

      setItems((current) => {
        const existingIds = new Set(current.map((item) => item.id));
        return sortWishlistByCreatedAt([
          ...current,
          ...page.filter((item) => !existingIds.has(item.id)),
        ]);
      });
      offsetRef.current += page.length;
      hasMoreRef.current = page.length === WISHLIST_PAGE_SIZE;
      setHasMore(hasMoreRef.current);
    } catch (cause) {
      if (requestId === requestIdRef.current) {
        setError(
          cause instanceof Error
            ? cause
            : new Error('Unable to load more wishlist items.'),
        );
      }
    } finally {
      if (requestId === requestIdRef.current) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    }
  }, [loading, selectedYear]);

  const updateItem = useCallback(
    async (
      id: string,
      update: Partial<Pick<WishlistItem, 'is_bought' | 'is_need'>>,
    ) => {
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

  const addItem = useCallback(
    async (input: CreateWishlistItemInput) => {
      setError(null);
      const item = await createWishlistItem(input);
      if (
        selectedYear === null ||
        Number(item.created_at.slice(0, 4)) === selectedYear
      ) {
        setItems((current) =>
          sortWishlistByCreatedAt([
            item,
            ...current.filter((currentItem) => currentItem.id !== item.id),
          ]),
        );
        offsetRef.current += 1;
        hasMoreRef.current = true;
        setHasMore(true);
      }
      return item;
    },
    [selectedYear],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    items,
    accountCreatedAt,
    loading,
    loadingMore,
    hasMore,
    error,
    refresh,
    loadMore,
    addItem,
    updateItem,
    savingIds,
  };
}
