import { ethers } from 'ethers';
import { useCallback, useState, useEffect } from 'react';
import { jsonRpcLoanFacilitator } from 'lib/contracts';
import { Fieldset } from 'components/Fieldset';
import { ParsedEvent } from './ParsedEvent';
import styles from './TicketHistory.module.css';
import { Loan } from 'lib/types/Loan';

interface TicketHistoryProps {
  loanInfo: Loan;
}

export function TicketHistory({ loanInfo }: TicketHistoryProps) {
  const [history, setHistory] = useState<ethers.Event[] | null>(null);

  const setup = useCallback(async () => {
    const history = await getTicketHistory(loanInfo.id);
    setHistory(history);
  }, [loanInfo.id]);

  useEffect(() => {
    setup();
  }, [setup]);

  return (
    <Fieldset legend="activity">
      <ol className={styles['top-level-list']}>
        {history !== null &&
          history.map((e: ethers.Event, i) => (
            <ParsedEvent event={e} loanInfo={loanInfo} key={i} />
          ))}
      </ol>
    </Fieldset>
  );
}

const getTicketHistory = async (loanId: ethers.BigNumber) => {
  const contract = jsonRpcLoanFacilitator();

  const mintTicketFilter = contract.filters.CreateLoan(loanId, null);
  const closeFilter = contract.filters.Close(loanId);
  const underwriteFilter = contract.filters.UnderwriteLoan(loanId);
  const buyoutUnderwriteFilter = contract.filters.BuyoutUnderwriter(loanId);
  const repayAndCloseFilter = contract.filters.Repay(loanId);
  const seizeCollateralFilter = contract.filters.SeizeCollateral(loanId);

  const filters = [
    mintTicketFilter,
    closeFilter,
    underwriteFilter,
    buyoutUnderwriteFilter,
    repayAndCloseFilter,
    seizeCollateralFilter,
  ];

  // TODO: keep track of TypedEvents so we don't have to do a type coercion
  // in ParsedEvent
  let allEvents: ethers.Event[] = [];
  for (let i = 0; i < filters.length; i++) {
    const results = await contract.queryFilter(
      filters[i],
      parseInt(process.env.NEXT_PUBLIC_FACILITATOR_START_BLOCK || ''),
    );
    allEvents = allEvents.concat(results);
  }
  allEvents.sort((a, b) => b.blockNumber - a.blockNumber);

  return allEvents;
};
