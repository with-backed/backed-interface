import * as nftLoans from 'types/generated/graphql/nftLoans';

export type BuyoutEvent = Omit<
  nftLoans.BuyoutEvent & { typename: 'BuyoutEvent' },
  'loan' | '__typename'
>;
export type CloseEvent = Omit<
  nftLoans.CloseEvent & { typename: 'CloseEvent' },
  'loan' | '__typename'
>;
export type CollateralSeizureEvent = Omit<
  nftLoans.CollateralSeizureEvent & {
    typename: 'CollateralSeizureEvent';
  },
  'loan' | '__typename'
>;
export type CreateEvent = Omit<
  nftLoans.CreateEvent & { typename: 'CreateEvent' },
  'loan' | '__typename'
>;
export type LendEvent = Omit<
  nftLoans.LendEvent & { typename: 'LendEvent' },
  'loan' | '__typename'
>;
export type RepaymentEvent = Omit<
  nftLoans.RepaymentEvent & {
    typename: 'RepaymentEvent';
  },
  'loan' | '__typename'
>;

export type Event =
  | BuyoutEvent
  | CloseEvent
  | CollateralSeizureEvent
  | CreateEvent
  | LendEvent
  | RepaymentEvent;
