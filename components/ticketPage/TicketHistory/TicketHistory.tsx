import { ethers } from 'ethers';
import { useCallback, useState, useEffect } from 'react';
import { jsonRpcLoanFacilitator } from 'lib/contracts';
import { LoanInfo } from 'lib/LoanInfoType';
import { Fieldset } from 'components/Fieldset';
import { ParsedEvent } from './ParsedEvent';
import styles from './TicketHistory.module.css';

interface TicketHistoryProps {
  loanInfo: LoanInfo;
}

export function TicketHistory({ loanInfo }: TicketHistoryProps) {
  const [history, setHistory] = useState<ethers.Event[] | null>(null);

  const setup = useCallback(async () => {
    const history = await getTicketHistory(loanInfo.loanId);
    setHistory(history);
  }, [loanInfo.loanId]);

  useEffect(() => {
    setup();
  }, [setup]);

  return (
    <Fieldset legend="activity">
      <ol className={styles['top-level-list']}>
        {Boolean(history) && history.map((e: ethers.Event, i) => (
          <ParsedEvent
            event={e}
            loanInfo={loanInfo}
            key={i}
          />
        ))}
      </ol>
    </Fieldset>
  );
}

const getTicketHistory = async (loanId) => {
  const contract = jsonRpcLoanFacilitator();

  const mintTicketFilter = contract.filters.CreateLoan(
    loanId,
    null,
  );
  const closeFilter = contract.filters.Close(loanId);
  const underwriteFilter = contract.filters.UnderwriteLoan(
    loanId,
  );
  const buyoutUnderwriteFilter = contract.filters.BuyoutUnderwriter(
    loanId,
  );
  const repayAndCloseFilter = contract.filters.Repay(
    loanId,
  );
  const seizeCollateralFilter = contract.filters.SeizeCollateral(
    loanId,
  );

  const filters = [
    mintTicketFilter,
    closeFilter,
    underwriteFilter,
    buyoutUnderwriteFilter,
    repayAndCloseFilter,
    seizeCollateralFilter,
  ];

  let allEvents = [];
  for (let i = 0; i < filters.length; i++) {
    const results = await contract.queryFilter(filters[i],
      parseInt(process.env.NEXT_PUBLIC_FACILITATOR_START_BLOCK));
    allEvents = allEvents.concat(results);
  }
  allEvents.sort((a, b) => b.blockNumber - a.blockNumber);

  return allEvents;
};
