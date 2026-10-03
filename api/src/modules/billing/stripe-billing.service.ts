import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";
import type { Plan } from "@skillmanager/shared";
import { PrismaService } from "../../prisma/prisma.service";
import {
  resolveWaiverLocale,
  WITHDRAWAL_WAIVER_TEXTS,
  WITHDRAWAL_WAIVER_VERSION,
} from "./withdrawal-waiver";

@Injectable()
export class StripeBillingService {
  private readonly logger = new Logger(StripeBillingService.name);
  readonly stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.stripe = new Stripe(this.config.getOrThrow("STRIPE_SECRET_KEY"));
  }

  getPriceIdForPlan(
    plan: "PRO" | "TEAM",
    interval: "month" | "year" = "month",
  ): string {
    if (plan === "TEAM") {
      const teamPrice = this.config.get<string>("STRIPE_PRICE_TEAM_MONTHLY");
      if (!teamPrice) {
        throw new BadRequestException({
          code: "VALIDATION_ERROR",
          message: "Price for TEAM is not configured (STRIPE_PRICE_TEAM_MONTHLY).",
        });
      }
      return teamPrice;
    }

    const key =
      interval === "year"
        ? "STRIPE_PRICE_PRO_YEARLY"
        : "STRIPE_PRICE_PRO_MONTHLY";
    const priceId = this.config.get<string>(key);
    if (!priceId) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: `Price for PRO (${interval}) is not configured (${key}).`,
      });
    }
    return priceId;
  }

  resolvePlanFromPriceId(priceId: string): Plan {
    const proMonthly = this.config.get<string>("STRIPE_PRICE_PRO_MONTHLY");
    const proYearly = this.config.get<string>("STRIPE_PRICE_PRO_YEARLY");
    const team = this.config.get<string>("STRIPE_PRICE_TEAM_MONTHLY");
    if (priceId && (priceId === proMonthly || priceId === proYearly)) {
      return "PRO";
    }
    if (priceId && priceId === team) return "TEAM";
    return "PRO";
  }

  async ensureStripeCustomer(user: {
    id: string;
    clerkId: string;
    email: string;
    subscription: {
      id: string;
      providerCustomerId: string | null;
    } | null;
  }): Promise<string> {
    if (user.subscription?.providerCustomerId) {
      return user.subscription.providerCustomerId;
    }

    const customer = await this.stripe.customers.create({
      email: user.email,
      metadata: {
        userId: user.id,
        clerkId: user.clerkId,
      },
    });

    if (user.subscription) {
      await this.prisma.subscription.update({
        where: { id: user.subscription.id },
        data: {
          provider: "stripe",
          providerCustomerId: customer.id,
        },
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          userId: user.id,
          plan: "FREE",
          status: "ACTIVE",
          provider: "stripe",
          providerCustomerId: customer.id,
        },
      });
    }

    return customer.id;
  }

  async createCheckoutSession(params: {
    userId: string;
    clerkId: string;
    email: string;
    plan: "PRO" | "TEAM";
    interval: "month" | "year";
    waiveWithdrawal: boolean;
    locale?: string;
  }): Promise<{ url: string }> {
    if (params.plan === "TEAM") {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "Team plan is coming soon.",
      });
    }

    if (!params.waiveWithdrawal) {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message:
          "You must waive the 14-day withdrawal right for the subscription to start immediately.",
      });
    }

    const dbUser = await this.prisma.user.findUnique({
      where: { clerkId: params.clerkId },
      include: { subscription: true },
    });

    if (!dbUser) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    if (dbUser.subscription?.plan === "PRO" || dbUser.subscription?.plan === "TEAM") {
      throw new BadRequestException({
        code: "VALIDATION_ERROR",
        message: "You already have an active paid plan. Use the billing portal to manage it.",
      });
    }

    const customerId = await this.ensureStripeCustomer({
      id: dbUser.id,
      clerkId: dbUser.clerkId,
      email: dbUser.email,
      subscription: dbUser.subscription,
    });

    const waiverLocale = resolveWaiverLocale(params.locale);
    const waiverText = WITHDRAWAL_WAIVER_TEXTS[waiverLocale];
    const waivedAt = new Date();

    await this.prisma.subscription.update({
      where: { userId: dbUser.id },
      data: {
        withdrawalWaivedAt: waivedAt,
        withdrawalWaiverVersion: WITHDRAWAL_WAIVER_VERSION,
        withdrawalWaiverInterval: params.interval,
        withdrawalWaiverLocale: waiverLocale,
        withdrawalWaiverText: waiverText,
      },
    });

    const priceId = this.getPriceIdForPlan(params.plan, params.interval);
    const webUrl = this.config.getOrThrow("WEB_URL");
    const waivedAtIso = waivedAt.toISOString();

    // Subscription Checkout creates Stripe invoices automatically (PDF + hosted
    // invoice page). We surface those in /billing; we do not issue custom PDFs.
    const session = await this.stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${webUrl}/billing?checkout=success`,
      cancel_url: `${webUrl}/billing?checkout=cancel`,
      client_reference_id: dbUser.id,
      billing_address_collection: "required",
      tax_id_collection: { enabled: true },
      customer_update: {
        address: "auto",
        name: "auto",
      },
      metadata: {
        userId: dbUser.id,
        clerkId: dbUser.clerkId,
        plan: params.plan,
        interval: params.interval,
        waiveWithdrawal: "true",
        waiveWithdrawalAt: waivedAtIso,
        waiveWithdrawalVersion: WITHDRAWAL_WAIVER_VERSION,
      },
      subscription_data: {
        metadata: {
          userId: dbUser.id,
          clerkId: dbUser.clerkId,
          plan: params.plan,
          interval: params.interval,
          waiveWithdrawal: "true",
          waiveWithdrawalAt: waivedAtIso,
          waiveWithdrawalVersion: WITHDRAWAL_WAIVER_VERSION,
        },
      },
      allow_promotion_codes: true,
    });

    if (!session.url) {
      throw new BadRequestException({
        code: "INTERNAL_ERROR",
        message: "Stripe did not return a checkout URL",
      });
    }

    return { url: session.url };
  }

  async createPortalSession(clerkId: string): Promise<{ url: string }> {
    const dbUser = await this.prisma.user.findUnique({
      where: { clerkId },
      include: { subscription: true },
    });

    if (!dbUser) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const customerId = await this.ensureStripeCustomer({
      id: dbUser.id,
      clerkId: dbUser.clerkId,
      email: dbUser.email,
      subscription: dbUser.subscription,
    });

    const webUrl = this.config.getOrThrow("WEB_URL");
    const session = await this.stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${webUrl}/billing`,
    });

    return { url: session.url };
  }

  async syncSubscriptionFromStripe(
    subscription: Stripe.Subscription,
  ): Promise<void> {
    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0]?.price?.id || "";
    const planFromMeta = subscription.metadata?.plan as Plan | undefined;
    const plan =
      planFromMeta === "PRO" || planFromMeta === "TEAM"
        ? planFromMeta
        : this.resolvePlanFromPriceId(priceId);

    let status: "ACTIVE" | "CANCELED" | "PAST_DUE" = "ACTIVE";
    if (
      subscription.status === "past_due" ||
      subscription.status === "unpaid"
    ) {
      status = "PAST_DUE";
    }
    if (
      subscription.status === "canceled" ||
      subscription.status === "incomplete_expired"
    ) {
      status = "CANCELED";
    }

    const periodEnd = (subscription as Stripe.Subscription & {
      current_period_end?: number;
    }).current_period_end;
    const currentPeriodEnd = periodEnd
      ? new Date(periodEnd * 1000)
      : undefined;

    const userId = subscription.metadata?.userId;
    let existing = await this.prisma.subscription.findFirst({
      where: { providerCustomerId: customerId },
    });

    if (!existing && userId) {
      existing = await this.prisma.subscription.findFirst({
        where: { userId },
      });
    }

    if (!existing) {
      this.logger.warn(
        `No local subscription for Stripe customer ${customerId}`,
      );
      return;
    }

    const effectivePlan = status === "CANCELED" ? "FREE" : plan;

    await this.prisma.subscription.update({
      where: { id: existing.id },
      data: {
        plan: effectivePlan as never,
        status: status === "CANCELED" ? "CANCELED" : status,
        provider: "stripe",
        providerCustomerId: customerId,
        ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
      },
    });

    this.logger.log(
      `Subscription synced: ${customerId} → ${effectivePlan} (${status})`,
    );
  }

  async handleCheckoutCompleted(
    session: Stripe.Checkout.Session,
  ): Promise<void> {
    const customerId = session.customer as string | null;
    const userId =
      session.metadata?.userId || session.client_reference_id || null;

    if (!customerId || !userId) {
      this.logger.warn("checkout.session.completed missing customer/userId");
      return;
    }

    const existing = await this.prisma.subscription.findFirst({
      where: { OR: [{ userId }, { providerCustomerId: customerId }] },
    });

    if (existing) {
      await this.prisma.subscription.update({
        where: { id: existing.id },
        data: {
          provider: "stripe",
          providerCustomerId: customerId,
        },
      });
    }

    if (session.subscription) {
      const subId =
        typeof session.subscription === "string"
          ? session.subscription
          : session.subscription.id;
      const subscription = await this.stripe.subscriptions.retrieve(subId);
      await this.syncSubscriptionFromStripe(subscription);
    }
  }

  async handleInvoiceEvent(
    invoice: Stripe.Invoice,
    eventType: "invoice.paid" | "invoice.payment_failed",
  ): Promise<void> {
    const customerId =
      typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
    if (!customerId) {
      this.logger.warn(`${eventType} missing customer`);
      return;
    }

    const subscriptionRef = (
      invoice as Stripe.Invoice & { subscription?: string | Stripe.Subscription | null }
    ).subscription;

    if (subscriptionRef) {
      const subId =
        typeof subscriptionRef === "string" ? subscriptionRef : subscriptionRef.id;
      const subscription = await this.stripe.subscriptions.retrieve(subId);
      await this.syncSubscriptionFromStripe(subscription);
      return;
    }

    const existing = await this.prisma.subscription.findFirst({
      where: { providerCustomerId: customerId },
    });
    if (!existing) {
      this.logger.warn(`No local subscription for invoice customer ${customerId}`);
      return;
    }

    if (eventType === "invoice.payment_failed") {
      await this.prisma.subscription.update({
        where: { id: existing.id },
        data: { status: "PAST_DUE" },
      });
      this.logger.log(`Marked PAST_DUE for customer ${customerId}`);
      return;
    }

    await this.prisma.subscription.update({
      where: { id: existing.id },
      data: { status: "ACTIVE" },
    });
    this.logger.log(`Marked ACTIVE after invoice.paid for ${customerId}`);
  }
}
