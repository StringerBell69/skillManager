import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  NotFoundException,
} from "@nestjs/common";
import type { DevicesResponse, Plan } from "@skillmanager/shared";
import { PrismaService } from "../../prisma/prisma.service";
import { ClerkAuthGuard } from "../auth-clerk/clerk-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { getDeviceLimit, mapDevices } from "./device-limits";

@Controller("v1/me/devices")
@UseGuards(ClerkAuthGuard)
export class CliTokensController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async listDevices(
    @CurrentUser() user: { clerkId: string },
  ): Promise<DevicesResponse> {
    const dbUser = await this.prisma.user.findUnique({
      where: { clerkId: user.clerkId },
      include: { subscription: true },
    });

    if (!dbUser) {
      return {
        plan: "FREE",
        deviceLimit: 1,
        deviceCount: 0,
        devices: [],
      };
    }

    const plan = (dbUser.subscription?.plan as Plan) || "FREE";
    const tokens = await this.prisma.cliToken.findMany({
      where: {
        userId: dbUser.id,
        revokedAt: null,
      },
      select: {
        id: true,
        name: true,
        lastUsedAt: true,
        createdAt: true,
      },
      orderBy: [{ lastUsedAt: "desc" }, { createdAt: "desc" }],
    });

    const devices = mapDevices(tokens);

    return {
      plan,
      deviceLimit: getDeviceLimit(plan),
      deviceCount: devices.length,
      devices,
    };
  }

  @Delete(":id")
  @HttpCode(200)
  async revokeDevice(
    @Param("id") id: string,
    @CurrentUser() user: { clerkId: string },
  ) {
    const dbUser = await this.prisma.user.findUnique({
      where: { clerkId: user.clerkId },
    });

    if (!dbUser) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "User not found",
      });
    }

    const token = await this.prisma.cliToken.findFirst({
      where: {
        id,
        userId: dbUser.id,
        revokedAt: null,
      },
    });

    if (!token) {
      throw new NotFoundException({
        code: "NOT_FOUND",
        message: "Device not found or already revoked",
      });
    }

    await this.prisma.cliToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });

    return { revoked: true };
  }
}
