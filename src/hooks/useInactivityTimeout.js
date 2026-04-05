import { useEffect, useRef, useCallback } from 'react';

/**
 * Automatically signs out the user after `timeoutMs` of inactivity.
 * @param {Function} onTimeout - called when the timeout fires
 * @param {number}   timeoutMs - inactivity window in ms (default 10 min)
 * @param {boolean}  enabled   - only run when a user is logged in
 */
export default function useInactivityTimeout(onTimeout, timeoutMs = 10 * 60 * 1000, enabled = true) {
  const timerRef = useRef(null);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(onTimeout, timeoutMs);
  }, [onTimeout, timeoutMs]);

  useEffect(() => {
    if (!enabled) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset(); // start the timer immediately

    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, reset]);
}