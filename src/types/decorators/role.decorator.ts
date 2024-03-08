import { ROLE } from '@enums';
import { SetMetadata } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: ROLE[]) => {
  return function (
    target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ) {
    SetMetadata(ROLES_KEY, roles)(target, propertyKey, descriptor);
    ApiOperation({
      summary: roles.map((role) => role.toUpperCase()).join(', '),
    })(target, propertyKey, descriptor);
  };
};
