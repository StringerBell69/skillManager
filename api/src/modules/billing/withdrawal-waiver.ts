/** Versioned legal copy for the 14-day withdrawal waiver (EU / FR). */
export const WITHDRAWAL_WAIVER_VERSION = "v1" as const;

export const WITHDRAWAL_WAIVER_TEXTS = {
  fr: "En m'abonnant, je renonce expressément à mon droit de rétractation de 14 jours afin que l'abonnement commence immédiatement.",
  en: "By subscribing, I expressly waive my 14-day withdrawal right so the subscription can start immediately.",
} as const;

export type WithdrawalWaiverLocale = keyof typeof WITHDRAWAL_WAIVER_TEXTS;

export function resolveWaiverLocale(locale: string | undefined): WithdrawalWaiverLocale {
  const normalized = (locale || "fr").toLowerCase().slice(0, 2);
  return normalized === "en" ? "en" : "fr";
}
