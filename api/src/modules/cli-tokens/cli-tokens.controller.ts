import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ClerkAuthGuard } from "../auth-clerk/clerk-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("v1/me/devices")
@UseGuards(ClerkAuthGuard)
export class CliTokensController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List all CLI tokens (devices) for the authenticated user.
   */
  @Get()
  async listDevices(@CurrentUser() user: { clerkId: string }) {
    const dbUser = await this.prisma.user.findUnique({
      where: { clerkId: user.clerkId },
    });

    if (!dbUser) {
      return [];
    }

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
      orderBy: { createdAt: "desc" },
    });

    return tokens.map((t) => ({
      id: t.id,
      name: t.name,
      lastUsedAt: t.lastUsedAt?.toISOString() ?? null,
      createdAt: t.createdAt.toISOString(),
    }));
  }

  /**
   * Revoke a CLI token (device).
   */
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
