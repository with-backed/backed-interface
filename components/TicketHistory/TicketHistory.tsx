import { Fieldset } from 'components/Fieldset';
import { ParsedEvent } from './ParsedEvent';
import { Loan } from 'types/Loan';
import styles from './TicketHistory.module.css';
import type { Event } from 'types/Event';
import useSWR from 'swr';
import { toObjectWithBigNumbers } from 'lib/parseSerializedResponse';
import { useMemo } from 'react';

interface TicketHistoryProps {
  loan: Loan;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function TicketHistory({ loan }: TicketHistoryProps) {
  const { data } = useSWR(`/api/loans/history/${loan.id}`, fetcher);

  const parsedData = useMemo(
    () => (data ? (data.map(toObjectWithBigNumbers) as Event[]) : []),
    [data],
  );

  return (
    <Fieldset legend="🎬 Activity">
      <div className={styles.container}>
        {!!parsedData &&
          parsedData.map((e) => (
            <ParsedEvent event={e} loan={loan} key={e.typename + e.id} />
          ))}
      </div>
    </Fieldset>
  );
}
