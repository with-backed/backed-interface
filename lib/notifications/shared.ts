export enum NotificationMethod {
  EMAIL = 'email',
}

export enum NotificationEventTrigger {
  ALL = 'all',
  BuyoutEvent = 'BuyoutEvent',
  LendEvent = 'LendEvent',
  RepaymentEvent = 'RepaymentEvent',
  CollateralSeizureEvent = 'CollateralSeizureEvent',
  LiquidationOccuring = 'LiquidationOccuring',
  LiquidationOccured = 'LiquidationOccured',
}

export type NotificationReqBody = {
  signedMessage: string;
};
