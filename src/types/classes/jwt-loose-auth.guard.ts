import { VALID_LOOSE_JWT_USER_STATUS } from '@/auth/constants';
import { IS_PUBLIC_KEY } from '@decorators/public-route.decorator';
import {
  ExecutionContext,
  ForbiddenException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtLooseAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  async canActivate(context: ExecutionContext) {
    try {
      try {
        await super.canActivate(context);
      } catch (error) {
        if (error instanceof HttpException) {
          throw error;
        }

        throw new UnauthorizedException('Can not access this resource');
      }

      const request = context.switchToHttp().getRequest();
      const user = request.user;

      if (!user) {
        throw new UnauthorizedException('Can not access this resource');
      }

      if (!VALID_LOOSE_JWT_USER_STATUS.includes(user.status)) {
        throw new ForbiddenException('Invalid User Status');
      }

      return true;
    } catch (error) {
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );

      if (isPublic) {
        return true;
      }

      throw error;
    }
  }
}
