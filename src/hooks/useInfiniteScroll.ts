import { useCallback, useEffect, useRef } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  enabled?: boolean;
  rootMargin?: string;
}

export function useInfiniteScroll(
  callback: () => void,
  options: UseInfiniteScrollOptions = {}
) {
  const {
    threshold = 100,
    enabled = true,
    rootMargin = '0px'
  } = options;

  const sentinelRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && enabled) {
        callbackRef.current();
      }
    },
    [enabled]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !enabled) return;

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin,
      threshold: (threshold / 100) //0.1
    });

    observer.observe(sentinel);

    return () => {
      observer.unobserve(sentinel);
    };
  }, [handleIntersection, enabled, rootMargin]);

  return { sentinelRef };
}
