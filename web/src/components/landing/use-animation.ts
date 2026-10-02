import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

function subscribeMedia(query: string) {
  return (callback: () => void) => {
    const list = window.matchMedia(query);
    list.addEventListener("change", callback);
    return () => list.removeEventListener("change", callback);
  };
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const subscribeReducedMotion = subscribeMedia(REDUCED_MOTION);

/**
 * True when the visitor asked for less motion. The server snapshot is `true`,
 * so prerendered HTML and the first client render always show the still frame.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );
}

function subscribeVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

/** False while the tab is in the background. */
export function usePageVisible(): boolean {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState === "visible",
    () => false,
  );
}

/** Whether the element is at least partly on screen. False until measured. */
export function useInView(ref: RefObject<Element | null>, rootMargin = "0px"): boolean {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return inView;
}

/**
 * A looping clock in milliseconds. It only ticks while `running`, and keeps its
 * position while paused so playback resumes where it stopped.
 */
export function useLoopClock(duration: number, running: boolean, startAt = 0, step = 50): number {
  const [time, setTime] = useState(startAt);

  useEffect(() => {
    if (!running) return;
    let last = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const delta = now - last;
      last = now;
      setTime((current) => (current + delta) % duration);
    }, step);
    return () => window.clearInterval(id);
  }, [running, duration, step]);

  return time;
}
