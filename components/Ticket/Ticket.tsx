import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { getLoanInfo } from 'lib/loan';
import TicketPageBody from 'components/ticketPage/TicketPageBody';
import { PawnShopHeader } from 'components/PawnShopHeader';
import { PageWrapper } from 'components/layouts/PageWrapper';
import { LoanInfo } from 'lib/LoanInfoType';
import { headerMessages, LoanStatus } from 'pawnshopConstants';
import { useTimestamp } from 'hooks/useTimestamp';

type LoanProps = {
  serverLoanInfo: LoanInfo;
};

export const Loan: FunctionComponent<LoanProps> = ({ serverLoanInfo }) => {
  const [loanInfo, setLoanInfo] = useState<LoanInfo>(serverLoanInfo);
  const timestamp = useTimestamp();

  const loanStatus: LoanStatus = useMemo(() => {
    if (!timestamp) {
      return 'indeterminate';
    }

    if (
      loanInfo.lastAccumulatedTimestamp
        .add(loanInfo.durationSeconds)
        .lte(timestamp)
    ) {
      return 'past due';
    }

    return 'active';
  }, [loanInfo, timestamp]);

  const messages = useMemo(
    () => (loanInfo ? headerMessages.ticket(loanInfo, loanStatus) : []),
    [loanInfo, loanStatus],
  );

  const fetchData = useCallback(() => {
    getLoanInfo(loanInfo.loanId.toString()).then((loanInfo) =>
      setLoanInfo(loanInfo),
    );
  }, [loanInfo.loanId]);

  useEffect(() => {
    if (!serverLoanInfo) {
      fetchData();
    }
  }, [serverLoanInfo, fetchData]);

  if (!loanInfo) {
    return (
      <PageWrapper>
        <PawnShopHeader messages={messages} />
        <h1>Loading...</h1>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <PawnShopHeader messages={messages} />
      <TicketPageBody loanInfo={loanInfo} refresh={fetchData} />
    </PageWrapper>
  );
};
