import { useState, useEffect, useRef, useCallback } from 'react';

interface UseLazyDataOptions<T> {
  fetchFn: () => Promise<T>;
  enabled?: boolean;
  threshold?: number;
  rootMargin?: string;
}

export function useLazyData<T>({
  fetchFn,
  enabled = true,
  threshold = 0.1,
  rootMargin = '100px'
}: UseLazyDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    if (hasTriggered || isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await fetchFn();
      setData(result);
      setHasTriggered(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, hasTriggered, isLoading]);

  useEffect(() => {
    if (!enabled || hasTriggered) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          fetchData();
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, [enabled, hasTriggered, fetchData, threshold, rootMargin]);

  const retry = useCallback(() => {
    setHasTriggered(false);
    setError(null);
    setData(null);
  }, []);

  return {
    data,
    isLoading,
    error,
    retry,
    triggerRef,
    hasTriggered
  };
}

// Hook for lazy loading lists with pagination
export function useLazyList<T>({
  fetchFn,
  enabled = true,
  threshold = 0.1,
  rootMargin = '100px'
}: UseLazyDataOptions<T[]>) {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const triggerRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const newItems = await fetchFn();
      if (newItems && newItems.length > 0) {
        setItems(prev => [...prev, ...newItems]);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, isLoading, hasMore]);

  useEffect(() => {
    if (!enabled || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => observer.disconnect();
  }, [enabled, hasMore, loadMore, threshold, rootMargin]);

  const reset = useCallback(() => {
    setItems([]);
    setError(null);
    setHasMore(true);
  }, []);

  return {
    items,
    isLoading,
    error,
    hasMore,
    loadMore,
    reset,
    triggerRef
  };
}
