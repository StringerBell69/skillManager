/**
 * Abstract billing provider interface.
 * Allows swapping between Stripe, Polar, Lemon Squeezy, etc.
 */
export interface BillingProvider {
  name: string;
  verifyWebhookSignature(payload: string | Buffer, signature: string, secret: string): boolean;
  parseSubscriptionEvent(event: unknown): SubscriptionUpdate | null;
}

export interface SubscriptionUpdate {
  providerCustomerId: string;
  plan: "FREE" | "PRO" | "TEAM";
  status: "ACTIVE" | "CANCELED" | "PAST_DUE";
  currentPeriodEnd?: Date;
}
