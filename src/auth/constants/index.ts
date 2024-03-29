import { ROLE, USER_STATUS } from '@enums';

export const INVALID_REGISTRATION_ROLE: ROLE[] = [ROLE.ADMIN];

export const VALID_LOGIN_STATUS: USER_STATUS[] = [
  USER_STATUS.ACTIVE,
  USER_STATUS.NOT_VERIFIED,
];

export const VALID_JWT_USER_STATUS: USER_STATUS[] = [USER_STATUS.ACTIVE];
export const VALID_LOOSE_JWT_USER_STATUS: USER_STATUS[] = [
  USER_STATUS.ACTIVE,
  USER_STATUS.NOT_VERIFIED,
];
