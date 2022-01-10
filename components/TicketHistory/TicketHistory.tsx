import { ethers } from 'ethers';
import { Fieldset } from 'components/Fieldset';
import { ParsedEvent } from './ParsedEvent';
import { Loan } from 'types/Loan';
import styles from './TicketHistory.module.css';
import useSWR from 'swr';
import { BetterEvent } from 'pages/api/loans/history/[id]';

const fetcher = (...args: Parameters<typeof fetch>): Promise<BetterEvent[]> =>
  fetch(...args).then(async (res) => {
    const json = await res.json();
    if (Array.isArray(json)) {
      const events = json;
      return events.map((e) => {
        const parsedArgs = { ...e.args };
        Object.entries(parsedArgs).forEach(([key, value]) => {
          if ((value as any).type === 'BigNumber') {
            parsedArgs[key] = ethers.BigNumber.from((value as any).hex);
          }
        });
        return { ...e, args: parsedArgs };
      });
    }
    return [];
  });

interface TicketHistoryProps {
  loan: Loan;
}

export function TicketHistory({ loan }: TicketHistoryProps) {
  const { data } = useSWR(`/api/loans/history/${loan.id}`, fetcher);

  return (
    <Fieldset legend="🎬 Activity">
      <div className={styles.container}>
        {!!data &&
          data.map((e: BetterEvent) => (
            <ParsedEvent
              event={e}
              loan={loan}
              key={e.transactionHash + e.event}
            />
          ))}
      </div>
    </Fieldset>
  );
}
