import React from 'react';
import type { CreateEvent, Event, LendEvent } from 'types/Event';
import { ParsedEvent } from 'components/TicketHistory/ParsedEvent';
import { Fieldset } from 'components/Fieldset';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { baseLoan, events } from 'lib/mockData';

export default {
  title: 'Components/TicketHistory/ParsedEvent',
  component: ParsedEvent,
};

const loan = baseLoan;

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
