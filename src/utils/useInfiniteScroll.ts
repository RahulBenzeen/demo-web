import { useCallback, useRef } from "react";

interface UseInfiniteScrollOptions {
  skip?: boolean;
  rootMargin?: string;
  threshold?: number;
}

export function useInfiniteScroll(callback: () => void, options: UseInfiniteScrollOptions = {}) {
  const { skip = false, rootMargin = "100px", threshold = 0.1 } = options;
  const observer = useRef<IntersectionObserver | null>(null);
  const callbackRef = useRef(callback);

  // Update the callback ref when the callback changes
  callbackRef.current = callback;

  const lastElementRef = useCallback(
    (node: HTMLElement | null) => {
      if (skip || !node) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            callbackRef.current();
          }
        },
        {
          rootMargin,
          threshold,
        },
      );

      observer.current.observe(node);
    },
    [skip, rootMargin, threshold],
  );

  return { lastElementRef };
}