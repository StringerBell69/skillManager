import { Module } from "@nestjs/common";
import { CliAuthController } from "./cli-auth.controller";
import { AuthClerkModule } from "../auth-clerk/auth-clerk.module";

@Module({
  imports: [AuthClerkModule],
  controllers: [CliAuthController],
})
export class CliAuthModule {}
