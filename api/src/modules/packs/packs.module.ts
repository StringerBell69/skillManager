import { Module } from "@nestjs/common";
import { PacksController } from "./packs.controller";
import { CliTokensModule } from "../cli-tokens/cli-tokens.module";

@Module({
  imports: [CliTokensModule],
  controllers: [PacksController],
})
export class PacksModule {}
