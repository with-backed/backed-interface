import {
  BuyoutEvent,
  CloseEvent,
  CollateralSeizureEvent,
  CreateEvent,
  LendEvent,
  RepaymentEvent,
} from './generated/graphql/nftLoans';

export type RawSubgraphEvent =
  | BuyoutEvent
  | CloseEvent
  | CollateralSeizureEvent
  | CreateEvent
  | LendEvent
  | RepaymentEvent;

export type RawEventNameType =
  | 'BuyoutEvent'
  | 'CloseEvent'
  | 'CollateralSeizureEvent'
  | 'CreateEvent'
  | 'LendEvent'
  | 'RepaymentEvent';
