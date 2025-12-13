import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * CurrentUser Decorator
 * Request'ten mevcut kullanıcıyı çeker
 * Kullanım: @CurrentUser() user: User
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
