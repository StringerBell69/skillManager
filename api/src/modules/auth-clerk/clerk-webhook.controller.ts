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
import { Webhook } from "svix";
import { PrismaService } from "../../prisma/prisma.service";

interface ClerkWebhookEvent {
  type: string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    primary_email_address_id?: string;
  };
}

@Controller("v1/webhooks")
export class ClerkWebhookController {
  private readonly logger = new Logger(ClerkWebhookController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  @Post("clerk")
  @HttpCode(200)
  async handleClerkWebhook(@Req() req: Request) {
    const webhookSecret = this.configService.getOrThrow("CLERK_WEBHOOK_SECRET");

    // Verify webhook signature using svix
    const wh = new Webhook(webhookSecret);

    const svixId = req.headers["svix-id"] as string;
    const svixTimestamp = req.headers["svix-timestamp"] as string;
    const svixSignature = req.headers["svix-signature"] as string;

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException({
        code: "WEBHOOK_SIGNATURE_INVALID",
        message: "Missing svix headers",
      });
    }

    let event: ClerkWebhookEvent;
    try {
      const rawBody = (req as any).rawBody;
      const payload = typeof rawBody === "string" ? rawBody : rawBody.toString("utf8");
      event = wh.verify(payload, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as ClerkWebhookEvent;
    } catch {
      throw new BadRequestException({
        code: "WEBHOOK_SIGNATURE_INVALID",
        message: "Invalid webhook signature",
      });
    }

    switch (event.type) {
      case "user.created": {
        const email =
          event.data.email_addresses?.[0]?.email_address || "unknown@example.com";
        await this.prisma.user.upsert({
          where: { clerkId: event.data.id },
          create: {
            clerkId: event.data.id,
            email,
            subscription: {
              create: {
                plan: "FREE",
                status: "ACTIVE",
              },
            },
          },
          update: { email },
        });
        this.logger.log(`User created: ${event.data.id}`);
        break;
      }

      case "user.deleted": {
        await this.prisma.user
          .delete({ where: { clerkId: event.data.id } })
          .catch(() => {
            // User may not exist in our DB
            this.logger.warn(`User not found for deletion: ${event.data.id}`);
          });
        this.logger.log(`User deleted: ${event.data.id}`);
        break;
      }

      default:
        this.logger.debug(`Unhandled webhook event: ${event.type}`);
    }

    return { received: true };
  }
}
