import { Fieldset } from 'components/Fieldset';
import { ParsedEvent } from './ParsedEvent';
import { Loan } from 'types/Loan';
import styles from './TicketHistory.module.css';
import type { Event } from 'types/Event';
import useSWR from 'swr';
import { parseSerializedResponse } from 'lib/parseSerializedResponse';

interface TicketHistoryProps {
  loan: Loan;
}

export function TicketHistory({ loan }: TicketHistoryProps) {
  const { data } = useSWR<Event[]>(
    `/api/loans/history/${loan.id}`,
    async (url) => {
      const response = await fetch(url);
      const json = await response.json();
      return parseSerializedResponse(json) as Event[];
    },
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
