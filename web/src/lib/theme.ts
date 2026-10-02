import { useCallback, useEffect, useSyncExternalStore } from "react";

export type ThemePreference = "light" | "dark" | "system";

/** Keep in sync with the inline script in index.html. */
const STORAGE_KEY = "sm-theme";
const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // Storage can be unavailable (private mode, blocked cookies).
  }
  return "system";
}

const media = () => window.matchMedia("(prefers-color-scheme: dark)");

export function applyTheme(preference: ThemePreference) {
  const dark = preference === "dark" || (preference === "system" && media().matches);
  const root = document.documentElement;
  root.classList.toggle("dark", dark);
  root.style.colorScheme = dark ? "dark" : "light";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useTheme() {
  const preference = useSyncExternalStore(subscribe, readPreference, () => "system" as const);

  useEffect(() => {
    if (preference !== "system") return;
    const query = media();
    const onChange = () => applyTheme("system");
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [preference]);

  const setPreference = useCallback((next: ThemePreference) => {
    try {
      if (next === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore: the choice still applies for this page view.
    }
    applyTheme(next);
    listeners.forEach((listener) => listener());
  }, []);

  return { preference, setPreference };
}
