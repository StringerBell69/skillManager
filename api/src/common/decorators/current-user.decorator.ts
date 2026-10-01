import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Extract the current user from the request.
 * Works with both ClerkAuthGuard (sets req.user from JWT)
 * and CliTokenGuard (sets req.user from token lookup).
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (data) {
      return user?.[data];
    }
    return user;
  },
);
