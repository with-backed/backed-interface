export enum NotificationMethod {
  EMAIL = 'email',
}

export enum NotificationEventTrigger {
  ALL = 'all',
  BuyoutEventBorrower = 'BuyoutEventBorrower',
  BuyoutEventOldLender = 'BuyoutEventOldLender',
  LendEvent = 'LendEvent',
  RepaymentEvent = 'RepaymentEvent',
  CollateralSeizureEvent = 'CollateralSeizureEvent',
  LiquidationOccurringBorrower = 'LiquidationOccurringBorrower',
  LiquidationOccurringLender = 'LiquidationOccurringLender',
  LiquidationOccurredBorrower = 'LiquidationOccurredBorrower',
  LiquidationOccurredLender = 'LiquidationOccurredLender',
}

export type NotificationReqBody = {
  signedMessage: string;
};
