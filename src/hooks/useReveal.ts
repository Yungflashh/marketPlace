import { useCallback, useEffect, useState } from 'react';

/**
 * Adds the `is-visible` class (see `.reveal` in index.css) once the element scrolls
 * into view. Uses a callback ref (not a plain useRef) so the observer is correctly
 * (re)attached whenever the underlying DOM node changes — including when the target
 * is conditionally rendered and mounts after the component's first render (e.g. a
 * results grid that only appears once loading finishes). A plain useRef would miss
 * that: its effect runs once, sees `ref.current === null`, and never runs again.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const [node, setNode] = useState<T | null>(null);
  const ref = useCallback((el: T | null) => setNode(el), []);

  useEffect(() => {
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      node.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('is-visible');
          observer.unobserve(node);
        }
      },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [node, threshold]);

  return ref;
}

export default useReveal;
