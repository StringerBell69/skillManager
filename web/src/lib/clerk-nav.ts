import type { NavigateFunction } from "react-router-dom";
import { resetPostHog } from "@/lib/posthog";

/**
 * Turns a Clerk navigation target into a same-origin path for React Router.
 * Absolute cross-origin URLs return null so the caller can use windowNavigate.
 */
export function clerkToPath(to: string, origin: string = window.location.origin): string | null {
  try {
    const url = new URL(to, origin);
    if (url.origin !== origin) return null;
    return `${url.pathname}${url.search}${url.hash}` || "/";
  } catch {
    return to.startsWith("/") ? to : null;
  }
}

type WindowNavigate = (to: string | URL) => void;

/**
 * Clerk's routerPush / routerReplace callback. Prefer React Router; fall back to
 * a full page load for off-site URLs (OAuth, etc.).
 */
export function createClerkRouter(
  navigate: NavigateFunction,
): {
  routerPush: (to: string, metadata?: { windowNavigate: WindowNavigate }) => void;
  routerReplace: (to: string, metadata?: { windowNavigate: WindowNavigate }) => void;
} {
  const go = (to: string, replace: boolean, windowNavigate?: WindowNavigate): void => {
    const path = clerkToPath(to);
    if (path) {
      navigate(path, { replace });
      return;
    }
    (windowNavigate ?? ((url) => window.location.assign(url)))(to);
  };

  return {
    routerPush: (to, metadata) => go(to, false, metadata?.windowNavigate),
    routerReplace: (to, metadata) => go(to, true, metadata?.windowNavigate),
  };
}

/** Sign out then navigate with React Router (avoids deprecated signOut redirectUrl). */
export async function signOutAndGo(
  signOut: () => Promise<unknown>,
  navigate: NavigateFunction,
  to: string = "/",
): Promise<void> {
  resetPostHog();
  await signOut();
  navigate(to, { replace: true });
}
