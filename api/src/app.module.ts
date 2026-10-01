import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthClerkModule } from "./modules/auth-clerk/auth-clerk.module";
import { CliAuthModule } from "./modules/cli-auth/cli-auth.module";
import { CliTokensModule } from "./modules/cli-tokens/cli-tokens.module";
import { BundleModule } from "./modules/bundle/bundle.module";
import { BillingModule } from "./modules/billing/billing.module";
import { AgentsAdminModule } from "./modules/agents-admin/agents-admin.module";
import { HealthModule } from "./modules/health/health.module";
import { envValidation } from "./config/env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidation,
    }),
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 1000,
        limit: 3,
      },
      {
        name: "medium",
        ttl: 10000,
        limit: 20,
      },
      {
        name: "long",
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthClerkModule,
    CliAuthModule,
    CliTokensModule,
    BundleModule,
    BillingModule,
    AgentsAdminModule,
    HealthModule,
  ],
})
export class AppModule {}
