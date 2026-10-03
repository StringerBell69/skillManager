import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  HttpCode,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { IsBoolean, IsIn, IsOptional, IsString } from "class-validator";
import Stripe from "stripe";
import type {
  BillingSummaryResponse,
  BillingInvoice,
  BillingUsage,
  Plan,
  UnlockedAgent,
} from "@skillmanager/shared";
import { PLAN_HIERARCHY, getDeviceLimit } from "@skillmanager/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { ClerkAuthGuard } from "../auth-clerk/clerk-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { StripeBillingService } from "./stripe-billing.service";

class CheckoutDto {
  @IsIn(["PRO", "TEAM"])
  plan!: "PRO" | "TEAM";

  @IsIn(["month", "year"])
  interval!: "month" | "year";

  @IsBoolean()
  waiveWithdrawal!: boolean;

  @IsOptional()
  @IsString()
  locale?: string;
}

const EMPTY_USAGE: BillingUsage = {
  deviceCount: 0,
  deviceLimit: 1,
  packsUnlocked: 0,
  packsTotal: 0,
  agentsUnlocked: 0,
  agentsTotal: 0,
};

@Controller("v1/me/billing")
@UseGuards(ClerkAuthGuard)
export class MeBillingController {
  private readonly stripe: Stripe;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly billing: StripeBillingService,
  ) {
    this.stripe = new Stripe(this.configService.getOrThrow("STRIPE_SECRET_KEY"));
  }

  @Get()
  async getBilling(
    @CurrentUser() user: { clerkId: string },
  ): Promise<BillingSummaryResponse> {
    const dbUser = await this.prisma.user.findUnique({
      where: { clerkId: user.clerkId },
      include: { subscription: true },
    });

    if (!dbUser) {
      return {
        email: "",
        plan: "FREE",
        status: "ACTIVE",
        currentPeriodEnd: null,
        provider: null,
        memberSince: null,
        usage: EMPTY_USAGE,
        unlockedAgents: [],
        invoices: [],
      };
    }

    const subscription = dbUser.subscription;
    const plan = (subscription?.plan as Plan) || "FREE";
    const [invoices, catalog] = await Promise.all([
      this.fetchInvoices(subscription?.providerCustomerId),
      this.fetchCatalog(dbUser.id, plan),
    ]);

    return {
      email: dbUser.email,
      plan,
      status:
        (subscription?.status as BillingSummaryResponse["status"]) || "ACTIVE",
      currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() ?? null,
      provider: subscription?.provider ?? null,
      memberSince: dbUser.createdAt.toISOString(),
      usage: catalog.usage,
      unlockedAgents: catalog.unlockedAgents,
      invoices,
    };
  }

  @Post("checkout")
  @HttpCode(200)
  async checkout(
    @CurrentUser() user: { clerkId: string },
    @Body() dto: CheckoutDto,
  ): Promise<{ url: string }> {
    const dbUser = await this.prisma.user.findUnique({
      where: { clerkId: user.clerkId },
    });

    return this.billing.createCheckoutSession({
      userId: dbUser?.id || "",
      clerkId: user.clerkId,
      email: dbUser?.email || "",
      plan: dto.plan,
      interval: dto.interval,
      waiveWithdrawal: dto.waiveWithdrawal,
      locale: dto.locale,
    });
  }

  @Post("portal")
  @HttpCode(200)
  async portal(
    @CurrentUser() user: { clerkId: string },
  ): Promise<{ url: string }> {
    return this.billing.createPortalSession(user.clerkId);
  }

  private async fetchCatalog(
    userId: string,
    plan: Plan,
  ): Promise<{ usage: BillingUsage; unlockedAgents: UnlockedAgent[] }> {
    const userPlanLevel = PLAN_HIERARCHY[plan] ?? 0;

    const [deviceCount, packs, agents] = await Promise.all([
      this.prisma.cliToken.count({
        where: { userId, revokedAt: null },
      }),
      this.prisma.pack.findMany({
        select: { planRequired: true },
      }),
      this.prisma.agent.findMany({
        include: {
          versions: {
            where: { publishedAt: { not: null } },
            orderBy: { publishedAt: "desc" },
            take: 1,
          },
        },
        orderBy: { name: "asc" },
      }),
    ]);

    const unlockedAgents: UnlockedAgent[] = agents
      .filter(
        (agent) =>
          (PLAN_HIERARCHY[agent.planRequired as Plan] ?? 0) <= userPlanLevel,
      )
      .map((agent) => ({
        slug: agent.slug,
        name: agent.name,
        description: agent.description,
        kind: agent.kind,
        planRequired: agent.planRequired as Plan,
        latestVersion: agent.versions[0]?.version || "0.0.0",
        installCommand: "sm install",
      }));

    const packsUnlocked = packs.filter(
      (pack) =>
        (PLAN_HIERARCHY[pack.planRequired as Plan] ?? 0) <= userPlanLevel,
    ).length;

    return {
      usage: {
        deviceCount,
        deviceLimit: getDeviceLimit(plan),
        packsUnlocked,
        packsTotal: packs.length,
        agentsUnlocked: unlockedAgents.length,
        agentsTotal: agents.length,
      },
      unlockedAgents,
    };
  }

  private async fetchInvoices(
    customerId: string | null | undefined,
  ): Promise<BillingInvoice[]> {
    if (!customerId) {
      return [];
    }

    try {
      const list = await this.stripe.invoices.list({
        customer: customerId,
        limit: 12,
      });

      return list.data.map((invoice) => {
        const amount = (invoice.amount_paid || invoice.amount_due || 0) / 100;
        const currency = (invoice.currency || "eur").toUpperCase();
        const locale = currency === "EUR" ? "fr-FR" : "en-US";
        const formatted = new Intl.NumberFormat(locale, {
          style: "currency",
          currency,
        }).format(amount);

        const status = (invoice.status || "open") as BillingInvoice["status"];

        return {
          id: invoice.id,
          number: invoice.number,
          date: new Date((invoice.created || 0) * 1000).toISOString(),
          description:
            invoice.lines.data[0]?.description ||
            invoice.description ||
            "Subscription",
          amount: formatted,
          currency,
          status,
          pdfUrl: invoice.invoice_pdf ?? null,
        };
      });
    } catch {
      return [];
    }
  }
}
