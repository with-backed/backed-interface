export enum NotificationMethod {
  EMAIL = 'email',
}

export enum NotificationEventTrigger {
  ALL = 'all',
  BuyoutEvent = 'BuyoutEvent',
  LendEvent = 'LendEvent',
  RepaymentEvent = 'RepaymentEvent',
  CollateralSeizureEvent = 'CollateralSeizureEvent',
  LiquidationOccurring = 'LiquidationOccurring',
  LiquidationOccurred = 'LiquidationOccurred',
}

export type NotificationReqBody = {
  signedMessage: string;
};
