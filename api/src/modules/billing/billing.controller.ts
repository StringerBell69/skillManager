import {
  Controller,
  Post,
  Req,
  HttpCode,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request } from "express";
import Stripe from "stripe";
import { PrismaService } from "../../prisma/prisma.service";

// Map Stripe price IDs to plans — configure via env in production
const PRICE_TO_PLAN: Record<string, string> = {
  // These should come from env in production
  price_pro_monthly: "PRO",
  price_pro_yearly: "PRO",
  price_team_monthly: "TEAM",
  price_team_yearly: "TEAM",
};

@Controller("v1/webhooks")
export class BillingController {
  private readonly logger = new Logger(BillingController.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.stripe = new Stripe(this.configService.getOrThrow("STRIPE_SECRET_KEY"));
  }

  @Post("stripe")
  @HttpCode(200)
  async handleStripeWebhook(@Req() req: Request) {
    const webhookSecret = this.configService.getOrThrow("STRIPE_WEBHOOK_SECRET");
    const signature = req.headers["stripe-signature"] as string;

    if (!signature) {
      throw new BadRequestException({
        code: "WEBHOOK_SIGNATURE_INVALID",
        message: "Missing Stripe signature",
      });
    }

    let event: Stripe.Event;
    try {
      const rawBody = (req as any).rawBody;
      event = this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      throw new BadRequestException({
        code: "WEBHOOK_SIGNATURE_INVALID",
        message: "Invalid Stripe webhook signature",
      });
    }

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionUpdate(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await this.handleSubscriptionCanceled(subscription);
        break;
      }

      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }

    return { received: true };
  }

  private async handleSubscriptionUpdate(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;
    const priceId = subscription.items.data[0]?.price?.id || "";
    const plan = PRICE_TO_PLAN[priceId] || "PRO";

    let status: "ACTIVE" | "CANCELED" | "PAST_DUE" = "ACTIVE";
    if (subscription.status === "past_due") status = "PAST_DUE";
    if (subscription.status === "canceled") status = "CANCELED";

    // Get period end from the subscription object
    const periodEnd = (subscription as any).current_period_end;
    const currentPeriodEnd = periodEnd ? new Date(periodEnd * 1000) : undefined;

    // Find the subscription by providerCustomerId
    const existing = await this.prisma.subscription.findFirst({
      where: { providerCustomerId: customerId },
    });

    if (existing) {
      await this.prisma.subscription.update({
        where: { id: existing.id },
        data: {
          plan: plan as any,
          status,
          ...(currentPeriodEnd ? { currentPeriodEnd } : {}),
        },
      });
    }

    this.logger.log(`Subscription updated: ${customerId} → ${plan} (${status})`);
  }

  private async handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    const customerId = subscription.customer as string;

    const existing = await this.prisma.subscription.findFirst({
      where: { providerCustomerId: customerId },
    });

    if (existing) {
      await this.prisma.subscription.update({
        where: { id: existing.id },
        data: {
          status: "CANCELED",
          plan: "FREE",
        },
      });
    }

    this.logger.log(`Subscription canceled: ${customerId}`);
  }

  // TODO: Implement checkout endpoint
  // POST /v1/billing/checkout { plan: "PRO" | "TEAM" }
  // Creates a Stripe Checkout Session and returns the URL
}
