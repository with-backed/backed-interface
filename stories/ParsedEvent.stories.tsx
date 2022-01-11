import React from 'react';
import type { CreateEvent, Event, LendEvent } from 'types/Event';
import { ParsedEvent } from 'components/TicketHistory/ParsedEvent';
import { Fieldset } from 'components/Fieldset';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { baseLoan } from 'lib/mockData';

export default {
  title: 'Components/TicketHistory/ParsedEvent',
  component: ParsedEvent,
};

const loan = baseLoan;

const createEvent: CreateEvent = {
  blockNumber: 9808300,
  creator: '0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
  id: '0x662993eef512ffe276ba4b86121626eba009b56fcdc98dfb18f12d749c58f1dc',
  maxPerSecondInterestRate: '15',
  minDurationSeconds: '259200',
  minLoanAmount: '10000000000000000000',
  timestamp: 1639409386,
  typename: 'CreateEvent',
};

const lendEvents: LendEvent[] = [
  {
    blockNumber: 9950758,
    borrowTicketHolder: '0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
    durationSeconds: '432000',
    id: '0x7685d19b85fb80c03ac0c117ea542b77a6c8ecebea56744b121183cfb614bce6',
    lender: '0x10359616ab170c1bd6c478a40c6715a49ba25efc',
    loanAmount: '10000000000000000000',
    perSecondInterestRate: '11',
    timestamp: 1641574026,
    typename: 'LendEvent',
  },
  {
    blockNumber: 9934164,
    borrowTicketHolder: '0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
    durationSeconds: '259200',
    id: '0xc99d7b9eeca31f9de0bdb9a5f8e29ad2f3a0291e34b265271f8bea30a3755d93',
    lender: '0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
    loanAmount: '10000000000000000000',
    perSecondInterestRate: '15',
    timestamp: 1641324990,
    typename: 'LendEvent',
  },
  {
    blockNumber: 9939034,
    borrowTicketHolder: '0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
    durationSeconds: '259200',
    id: '0xe19fdc887e019a979969459cd36011c756b38ee597a953dde223619f7ced153c',
    lender: '0x0dd7d78ed27632839cd2a929ee570ead346c19fc',
    loanAmount: '10000000000000000000',
    perSecondInterestRate: '12',
    timestamp: 1641398082,
    typename: 'LendEvent',
  },
];

const events: Event[] = [createEvent, ...lendEvents].sort(
  (a, b) => b.blockNumber - a.blockNumber,
);

export const ParsedEvents = () => {
  return (
    <ThreeColumn>
      <Fieldset legend="loan history">
        {events.map((e, i) => (
          <ParsedEvent key={i} event={e} loan={loan} />
        ))}
      </Fieldset>
    </ThreeColumn>
  );
};
