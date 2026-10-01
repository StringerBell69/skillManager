import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  BadRequestException,
  GoneException,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ThrottlerGuard } from "@nestjs/throttler";
import { PrismaService } from "../../prisma/prisma.service";
import { ClerkAuthGuard } from "../auth-clerk/clerk-auth.guard";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import {
  sha256,
  generateDeviceCode,
  generateUserCode,
  generateCliToken,
} from "../../common/utils/crypto";

import { IsString, IsOptional } from "class-validator";

class StartDto {
  @IsString()
  @IsOptional()
  hostname?: string;
}

class PollDto {
  @IsString()
  deviceCode!: string;
}

class ApproveDto {
  @IsString()
  userCode!: string;
}

class DenyDto {
  @IsString()
  userCode!: string;
}

@Controller("v1/cli/auth")
export class CliAuthController {
  private readonly logger = new Logger(CliAuthController.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Start the device flow.
   * Returns a userCode for the user to enter on the web, and a deviceCode
   * for the CLI to poll with.
   */
  @Post("start")
  @HttpCode(200)
  async start(@Body() dto: StartDto) {
    const deviceCode = generateDeviceCode();
    const userCode = generateUserCode();
    const expiresAt = new Date(Date.now() + 600_000); // 10 minutes

    await this.prisma.deviceAuth.create({
      data: {
        deviceCodeHash: sha256(deviceCode),
        userCode,
        hostname: dto.hostname,
        expiresAt,
      },
    });

    const webUrl = this.configService.getOrThrow("WEB_URL");

    return {
      deviceCode,
      userCode,
      verificationUrl: `${webUrl}/cli?code=${userCode}`,
      interval: 2,
      expiresIn: 600,
    };
  }

  /**
   * Poll for the device flow status.
   * Called by the CLI repeatedly until approved, denied, or expired.
   */
  @Post("poll")
  @HttpCode(200)
  @UseGuards(ThrottlerGuard)
  async poll(@Body() dto: PollDto) {
    const deviceCodeHash = sha256(dto.deviceCode);

    const deviceAuth = await this.prisma.deviceAuth.findFirst({
      where: { deviceCodeHash },
    });

    if (!deviceAuth) {
      return { status: "expired" };
    }

    if (deviceAuth.expiresAt < new Date()) {
      // Cleanup expired entry
      await this.prisma.deviceAuth.delete({ where: { id: deviceAuth.id } }).catch(() => {});
      return { status: "expired" };
    }

    if (deviceAuth.status === "DENIED") {
      await this.prisma.deviceAuth.delete({ where: { id: deviceAuth.id } }).catch(() => {});
      return { status: "denied" };
    }

    if (deviceAuth.status === "PENDING") {
      return { status: "pending" };
    }

    // APPROVED — generate token and clean up
    if (!deviceAuth.userId) {
      throw new BadRequestException({
        code: "INTERNAL_ERROR",
        message: "Approved device auth has no user",
      });
    }

    const token = generateCliToken();
    const tokenHash = sha256(token);

    await this.prisma.cliToken.create({
      data: {
        userId: deviceAuth.userId,
        tokenHash,
        name: deviceAuth.hostname || "CLI",
      },
    });

    // Delete the device auth (one-time use)
    await this.prisma.deviceAuth.delete({ where: { id: deviceAuth.id } });

    this.logger.log(`CLI token issued for user ${deviceAuth.userId}`);

    return {
      status: "approved",
      token,
    };
  }

  /**
   * Approve a device flow (called from the web by an authenticated user).
   */
  @Post("approve")
  @HttpCode(200)
  @UseGuards(ClerkAuthGuard, ThrottlerGuard)
  async approve(
    @Body() dto: ApproveDto,
    @CurrentUser() user: { clerkId: string },
  ) {
    const deviceAuth = await this.prisma.deviceAuth.findUnique({
      where: { userCode: dto.userCode },
    });

    if (!deviceAuth) {
      throw new BadRequestException({
        code: "USER_CODE_INVALID",
        message: "Invalid or expired user code",
      });
    }

    if (deviceAuth.expiresAt < new Date()) {
      await this.prisma.deviceAuth.delete({ where: { id: deviceAuth.id } }).catch(() => {});
      throw new GoneException({
        code: "DEVICE_CODE_EXPIRED",
        message: "This code has expired",
      });
    }

    if (deviceAuth.status !== "PENDING") {
      throw new BadRequestException({
        code: "USER_CODE_INVALID",
        message: "This code has already been used",
      });
    }

    // Find our internal user
    const dbUser = await this.prisma.user.findUnique({
      where: { clerkId: user.clerkId },
    });

    if (!dbUser) {
      throw new BadRequestException({
        code: "UNAUTHORIZED",
        message: "User not found. Please try logging in again.",
      });
    }

    await this.prisma.deviceAuth.update({
      where: { id: deviceAuth.id },
      data: {
        status: "APPROVED",
        userId: dbUser.id,
      },
    });

    this.logger.log(`Device auth approved by user ${dbUser.id}`);

    return { approved: true };
  }

  /**
   * Deny a device flow (called from the web by an authenticated user).
   */
  @Post("deny")
  @HttpCode(200)
  @UseGuards(ClerkAuthGuard, ThrottlerGuard)
  async deny(@Body() dto: DenyDto) {
    const deviceAuth = await this.prisma.deviceAuth.findUnique({
      where: { userCode: dto.userCode },
    });

    if (!deviceAuth || deviceAuth.status !== "PENDING") {
      throw new BadRequestException({
        code: "USER_CODE_INVALID",
        message: "Invalid or expired user code",
      });
    }

    await this.prisma.deviceAuth.update({
      where: { id: deviceAuth.id },
      data: { status: "DENIED" },
    });

    return { denied: true };
  }
}
