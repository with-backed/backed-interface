import React, { FunctionComponent, useCallback, useState } from 'react';
import { getLoanInfo } from 'lib/loan';
import TicketPageBody from 'components/ticketPage/TicketPageBody';
import { PawnShopHeader } from 'components/PawnShopHeader';
import { PageWrapper } from 'components/layouts/PageWrapper';
import { LoanInfo } from 'lib/LoanInfoType';
import { headerMessages } from 'pawnshopConstants';

type LoanProps = {
  serverLoanInfo: LoanInfo;
};

export const Loan: FunctionComponent<LoanProps> = ({ serverLoanInfo }) => {
  const [loanInfo, setLoanInfo] = useState<LoanInfo>(serverLoanInfo);

  const fetchData = useCallback(() => {
    getLoanInfo(loanInfo.loanId.toString()).then((loanInfo) =>
      setLoanInfo(loanInfo),
    );
  }, [loanInfo.loanId]);

  return (
    <PageWrapper>
      <PawnShopHeader message={headerMessages.ticket(loanInfo)} />
      <TicketPageBody loanInfo={loanInfo} refresh={fetchData} />
    </PageWrapper>
  );
};
