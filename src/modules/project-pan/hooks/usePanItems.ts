import { useCallback, useEffect, useState } from 'react';
import { getPanItems } from '../services/panService';
import type { VanityItem } from '../../../types';

export function usePanItems() {
  const [items, setItems] = useState<VanityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setItems(await getPanItems());
    } catch (cause) {
      setError(
        cause instanceof Error ? cause : new Error('Unable to load pan items.'),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const addItem = useCallback((item: VanityItem) => {
    setItems((currentItems) => [item, ...currentItems]);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, loading, error, refresh, addItem };
}
