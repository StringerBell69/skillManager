import posthog from "posthog-js";

const TOKEN = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN?.trim();
const HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";

let initialized = false;

/** Initialize once on the client. No-op when the project token is unset (local builds). */
export function initPostHog(): void {
  if (initialized || !TOKEN || typeof window === "undefined") return;
  posthog.init(TOKEN, {
    api_host: HOST,
    defaults: "2026-01-30",
    person_profiles: "identified_only",
    capture_pageview: true,
    capture_pageleave: true,
  });
  initialized = true;
}

export function isPostHogEnabled(): boolean {
  return Boolean(TOKEN);
}

/** Capture a product event. Safe when PostHog is not configured. */
export function track(event: string, properties?: Record<string, unknown>): void {
  if (!TOKEN) return;
  posthog.capture(event, properties);
}

export function identifyUser(
  distinctId: string,
  properties?: { email?: string | null; name?: string | null },
): void {
  if (!TOKEN) return;
  const person: Record<string, string> = {};
  if (properties?.email) person.email = properties.email;
  if (properties?.name) person.name = properties.name;
  posthog.identify(distinctId, Object.keys(person).length ? person : undefined);
}

export function resetPostHog(): void {
  if (!TOKEN) return;
  posthog.reset();
}

export { posthog };
