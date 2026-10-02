/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
  readonly VITE_API_URL?: string;
  readonly VITE_SITE_URL?: string;
  readonly VITE_PRICE_PRO_MONTHLY?: string;
  readonly VITE_PRICE_PRO_YEARLY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** Year of the build, so prerendered and hydrated markup always match. */
declare const __BUILD_YEAR__: number;
