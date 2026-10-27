import { useEffect, useRef } from "react";

/**
 * Runs `fn` immediately and then on a fixed interval. Cleans up on unmount.
 * Used to refresh dashboard data via polling until realtime is enabled.
 */
export function usePolling(fn: () => void, intervalMs: number, enabled = true) {
  const savedFn = useRef(fn);
  useEffect(() => {
    savedFn.current = fn;
  }, [fn]);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    savedFn.current();
    const id = window.setInterval(() => {
      if (active) savedFn.current();
    }, intervalMs);
    return () => {
      active = false;
      window.clearInterval(id);
    };
  }, [intervalMs, enabled]);
}
