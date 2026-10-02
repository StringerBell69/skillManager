import { useEffect, useRef, useState } from "react";

const POLL_EVERY_MS = 3_000;
const POLL_FOR_MS = 30_000;

/**
 * After Stripe Checkout, the plan changes only once Stripe's webhook reaches
 * the API. While `waiting` is true, call `refetch` every 3 seconds, for at most
 * 30 seconds in total. Returns true once that budget is spent.
 */
export function useActivationPolling(waiting: boolean, refetch: () => unknown): boolean {
  const [timedOut, setTimedOut] = useState(false);
  const startedAt = useRef<number | null>(null);
  const refetchRef = useRef(refetch);

  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    if (!waiting || timedOut) return;

    startedAt.current ??= Date.now();
    const remaining = Math.max(POLL_FOR_MS - (Date.now() - startedAt.current), 0);

    const interval = window.setInterval(() => void refetchRef.current(), POLL_EVERY_MS);
    const timeout = window.setTimeout(() => {
      window.clearInterval(interval);
      setTimedOut(true);
    }, remaining);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [waiting, timedOut]);

  return timedOut;
}
