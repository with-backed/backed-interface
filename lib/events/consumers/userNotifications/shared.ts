import { RawEventNameType } from 'types/RawEvent';

export enum NotificationMethod {
  EMAIL = 'email',
}

export type NotificationTriggerType =
  | RawEventNameType
  | 'LiquidationOccurringBorrower'
  | 'LiquidationOccurringLender'
  | 'LiquidationOccurredBorrower'
  | 'LiquidationOccurredLender'
  | 'All';

export type NotificationReqBody = {
  signedMessage: string;
};
