import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { sha256 } from "../../common/utils/crypto";

@Injectable()
export class CliTokenGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith("Bearer sm_")) {
      throw new UnauthorizedException({
        code: "TOKEN_INVALID",
        message: "Missing or invalid CLI token",
      });
    }

    const token = authHeader.slice(7); // "sm_..."
    const tokenHash = sha256(token);

    const cliToken = await this.prisma.cliToken.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: {
            subscription: true,
          },
        },
      },
    });

    if (!cliToken) {
      throw new UnauthorizedException({
        code: "TOKEN_INVALID",
        message: "Invalid CLI token",
      });
    }

    if (cliToken.revokedAt) {
      throw new UnauthorizedException({
        code: "TOKEN_REVOKED",
        message: "This token has been revoked. Please run 'skillmanager login' again.",
      });
    }

    // Update lastUsedAt (fire and forget)
    this.prisma.cliToken
      .update({
        where: { id: cliToken.id },
        data: { lastUsedAt: new Date() },
      })
      .catch(() => {}); // Don't fail the request

    // Attach user to request
    request.user = {
      id: cliToken.user.id,
      clerkId: cliToken.user.clerkId,
      email: cliToken.user.email,
      tokenId: cliToken.id,
      subscription: cliToken.user.subscription,
    };

    return true;
  }
}
