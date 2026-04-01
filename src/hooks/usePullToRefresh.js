import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * usePullToRefresh
 * Attaches a native pull-to-refresh gesture.
 * @param {Function} onRefresh - async callback triggered when pull threshold is met
 * @param {number} threshold - pixels to pull before triggering (default 70)
 */
export default function usePullToRefresh(onRefresh, threshold = 70) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(null);
  const pulling = useRef(false);

  const handleTouchStart = useCallback((e) => {
    if (window.scrollY > 0) return;
    startY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (startY.current === null) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      pulling.current = true;
      setPullDistance(Math.min(delta, threshold * 1.8));
    }
  }, [threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!pulling.current) return;
    pulling.current = false;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      setPullDistance(0);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    } else {
      setPullDistance(0);
    }
    startY.current = null;
  }, [pullDistance, threshold, onRefresh]);

  useEffect(() => {
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { pullDistance, isRefreshing };
}