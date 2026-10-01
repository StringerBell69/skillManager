import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { timingSafeCompare } from "../../common/utils/crypto";

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers["x-admin-api-key"] as string;

    if (!apiKey) {
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: "Missing admin API key",
      });
    }

    const expectedKey = this.configService.getOrThrow("ADMIN_API_KEY");

    if (!timingSafeCompare(apiKey, expectedKey)) {
      throw new ForbiddenException({
        code: "FORBIDDEN",
        message: "Invalid admin API key",
      });
    }

    return true;
  }
}
