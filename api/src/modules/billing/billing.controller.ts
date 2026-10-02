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
import { StripeBillingService } from "./stripe-billing.service";

@Controller("v1/webhooks")
export class BillingController {
  private readonly logger = new Logger(BillingController.name);
  private readonly stripe: Stripe;

  constructor(
    private readonly billing: StripeBillingService,
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
      const rawBody = (req as { rawBody?: Buffer | string }).rawBody;
      event = this.stripe.webhooks.constructEvent(
        rawBody as Buffer,
        signature,
        webhookSecret,
      );
    } catch {
      throw new BadRequestException({
        code: "WEBHOOK_SIGNATURE_INVALID",
        message: "Invalid Stripe webhook signature",
      });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.billing.handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await this.billing.syncSubscriptionFromStripe(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await this.billing.syncSubscriptionFromStripe({
          ...subscription,
          status: "canceled",
        } as Stripe.Subscription);
        break;
      }

      case "invoice.paid":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await this.billing.handleInvoiceEvent(invoice, event.type);
        break;
      }

      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }

    return { received: true };
  }
}
