export enum NotificationMethod {
  EMAIL = 'email',
}

export type CreateNotificationReqBody = {
  address: string;
  method: NotificationMethod;
  destination: string;
};
