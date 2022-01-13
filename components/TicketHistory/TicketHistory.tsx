import { Fieldset } from 'components/Fieldset';
import { ParsedEvent } from './ParsedEvent';
import { Loan } from 'types/Loan';
import styles from './TicketHistory.module.css';
import type { Event } from 'types/Event';
import useSWR from 'swr';

interface TicketHistoryProps {
  loan: Loan;
}

export function TicketHistory({ loan }: TicketHistoryProps) {
  const { data } = useSWR<Event[]>(`/api/loans/history/${loan.id}`, (url) =>
    fetch(url).then((res) => res.json()),
  );

  return (
    <Fieldset legend="🎬 Activity">
      <div className={styles.container}>
        {!!data &&
          data.map((e) => (
            <ParsedEvent event={e} loan={loan} key={e.typename + e.id} />
          ))}
      </div>
    </Fieldset>
  );
}
