import { Module } from "@nestjs/common";
import { BillingController } from "./billing.controller";
import { MeBillingController } from "./me-billing.controller";
import { MeCatalogController } from "./me-catalog.controller";
import { StripeBillingService } from "./stripe-billing.service";
import { AuthClerkModule } from "../auth-clerk/auth-clerk.module";

@Module({
  imports: [AuthClerkModule],
  controllers: [BillingController, MeBillingController, MeCatalogController],
  providers: [StripeBillingService],
  exports: [StripeBillingService],
})
export class BillingModule {}
