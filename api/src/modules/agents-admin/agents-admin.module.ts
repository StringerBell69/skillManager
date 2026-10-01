import { Module } from "@nestjs/common";
import { AgentsAdminController } from "./agents-admin.controller";
import { AdminGuard } from "./admin.guard";

@Module({
  controllers: [AgentsAdminController],
  providers: [AdminGuard],
})
export class AgentsAdminModule {}
