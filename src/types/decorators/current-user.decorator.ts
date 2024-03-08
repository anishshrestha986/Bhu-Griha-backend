import { IUserDocument } from '@interfaces/entities';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ROLE } from '../enums';

export type CurrentRequestUser = IUserDocument & { role: ROLE };

export const CurrentUser = createParamDecorator(
  (_data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: CurrentRequestUser = request.user;
    return user;
  },
);
