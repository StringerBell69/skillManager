import { Module } from "@nestjs/common";
import { BundleController } from "./bundle.controller";
import { CliTokensModule } from "../cli-tokens/cli-tokens.module";

@Module({
  imports: [CliTokensModule],
  controllers: [BundleController],
})
export class BundleModule {}
