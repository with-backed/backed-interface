export enum NotificationMethod {
  EMAIL = 'email',
}

export enum NotificationEventTrigger {
  ALL = 'all',
}

export type NotificationReqBody = {
  signedMessage: string;
};
