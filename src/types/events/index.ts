enum userEvents {
  USER_REGISTERED = 'user.registered',
  USER_STATUS_UPDATED = 'user.status.updated',

  EMAIL_VERIFICATION = 'email.verification',
  EMAIL_VERIFIED = 'email.verified',
  FORGOT_PASSWORD = 'forgot.password',
  PASSWORD_CHANGED = 'password.changed',
}

enum propertyEvents {
  PROPERTY_CREATED = 'Property.created',
  PROPERTY_UPDATED = 'Property.updated',
  PROPERTY_DELETED = 'Property.deleted',
}
const EVENTS = {
  ...userEvents,
  ...propertyEvents,
};

export type EVENTS = (typeof EVENTS)[keyof typeof EVENTS];

export default EVENTS;
