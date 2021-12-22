import { CreateLoanEvent, RepayEvent } from 'abis/types/NFTLoanFacilitator';
import { BuyoutEvent } from './BuyoutEvent';
import { CollateralSeizureEvent } from './CollateralSeizureEvent';
import { LendEvent } from './LendEvent';

export type LoanEvent =
  | CreateLoanEvent
  | LendEvent
  | BuyoutEvent
  | RepayEvent
  | CollateralSeizureEvent
  | CloseEvent;
