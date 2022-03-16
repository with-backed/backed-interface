import { Event } from 'types/Event';

type EventName = Pick<Event, 'typename'>['typename'];

const eventNames: {
  [key in EventName]: string;
} = {
  BuyoutEvent: 'Buyout Event',
  CloseEvent: 'Close Loan',
  CreateEvent: 'Create Loan',
  RepaymentEvent: 'Repay Loan',
  CollateralSeizureEvent: 'Seize Collateral',
  LendEvent: 'Lend Event',
};

export function renderEventName(name: EventName) {
  return eventNames[name];
}
