export const TOKEN_TYPE = {
  REFRESH: 'refresh',
  ACCESS: 'access',
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
};

export type TOKEN_TYPE = (typeof TOKEN_TYPE)[keyof typeof TOKEN_TYPE];
