import { useState, useEffect } from "react";

interface IntersectionObserverOptions {
  threshold?: number;
  root?: Element | Document | null;
  rootMargin?: string;
}

export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  {
    threshold = 0.1,
    root = null,
    rootMargin = "0%",
  }: IntersectionObserverOptions = {}
) {
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  useEffect(() => {
    const element = elementRef?.current;
    
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setEntry(entry);
      },
      {
        threshold,
        root,
        rootMargin,
      }
    );
    
    observer.observe(element);
    
    return () => {
      observer.disconnect();
    };
  }, [elementRef, threshold, root, rootMargin]);

  return entry;
}
