import { Module } from "@nestjs/common";
import { CliTokenGuard } from "./cli-token.guard";
import { CliTokensController } from "./cli-tokens.controller";
import { AuthClerkModule } from "../auth-clerk/auth-clerk.module";

@Module({
  imports: [AuthClerkModule],
  controllers: [CliTokensController],
  providers: [CliTokenGuard],
  exports: [CliTokenGuard],
})
export class CliTokensModule {}
