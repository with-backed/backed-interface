import { Fieldset } from 'components/Fieldset';
import { ParsedEvent } from './ParsedEvent';
import { Loan } from 'types/Loan';
import styles from './TicketHistory.module.css';
import type { Event } from 'types/Event';

interface TicketHistoryProps {
  loan: Loan;
  events: Event[];
}

export function TicketHistory({ loan, events }: TicketHistoryProps) {
  return (
    <Fieldset legend="🎬 Activity">
      <div className={styles.container}>
        {events.map((e) => (
          <ParsedEvent event={e} loan={loan} key={e.typename + e.id} />
        ))}
      </div>
    </Fieldset>
  );
}
