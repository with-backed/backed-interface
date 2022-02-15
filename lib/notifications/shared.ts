export enum NotificationMethod {
  EMAIL = 'email',
}

export type NotificationReqBody = {
  signedMessage: string;
};
