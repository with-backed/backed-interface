import { EventAsStringType } from 'types/Event';

export enum NotificationMethod {
  EMAIL = 'email',
}

export type NotificationTriggerType =
  | EventAsStringType
  | 'LiquidationOccurringBorrower'
  | 'LiquidationOccurringLender'
  | 'LiquidationOccurredBorrower'
  | 'LiquidationOccurredLender'
  | 'All';

export type NotificationReqBody = {
  signedMessage: string;
};
