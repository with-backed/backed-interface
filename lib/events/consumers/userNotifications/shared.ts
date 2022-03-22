import { RawEventNameType } from 'types/RawEvent';

export enum NotificationMethod {
  EMAIL = 'email',
}

export type NotificationTriggerType =
  | RawEventNameType
  | 'LiquidationOccurring'
  | 'LiquidationOccurred'
  | 'All';

export type NotificationReqBody = {
  signedMessage: string;
};
