import { useCallback, useEffect, useRef, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { rateProductsBulk } from '../api/clients';

type RatingItem = { product_id: number; rating: number };

export function useBulkRatings() {
  const [queue, setQueue] = useState<RatingItem[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const enqueue = useCallback((item: RatingItem) => {
    setQueue((q) => [...q, item]);
  }, []);

  const flush = useCallback(async () => {
    if (queue.length === 0) return;
    try {
      const state = await NetInfo.fetch();
      if (!state.isConnected) return; // stay queued, try later

      const chunk = queue.slice();
      setQueue([]); // optimistic
      await rateProductsBulk(chunk);
    } catch {
      // put them back on failure (simple retry)
      setQueue((q) => [...queue, ...q]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue]);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(), 2500); // debounce 2.5s
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [queue, flush]);

  return { enqueue, flush, pendingCount: queue.length };
}
