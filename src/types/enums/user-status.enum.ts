export const USER_STATUS = {
  NOT_VERIFIED: 'not_verified',
  BANNED: 'banned',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
} as const;

export type USER_STATUS = (typeof USER_STATUS)[keyof typeof USER_STATUS];
