import { useCallback, useEffect, useState } from 'react';
import { getProgressLogs } from '../services/progressLogService';
import type { ProgressLog } from '../../../types';

export function useProgressLogs(vanityItemId?: string) {
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setLogs(await getProgressLogs(vanityItemId));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause
          : new Error('Unable to load progress logs.'),
      );
    } finally {
      setLoading(false);
    }
  }, [vanityItemId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { logs, loading, error, refresh };
}
