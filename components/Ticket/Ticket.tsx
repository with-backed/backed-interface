import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';
import { getLoanInfo } from 'lib/loan';
import TicketPageBody from 'components/ticketPage/TicketPageBody';
import { PawnShopHeader } from 'components/PawnShopHeader';
import { PageWrapper } from 'components/layouts/PageWrapper';
import { LoanInfo } from 'lib/LoanInfoType';
import { LoanPageProps } from 'pages/loans/[id]';

type LoanProps = {
  serverLoanInfo: LoanInfo;
};

export const Loan: FunctionComponent<LoanProps> = ({ serverLoanInfo }) => {
  const [loanInfo, setLoanInfo] = useState<LoanInfo>(serverLoanInfo);

  const fetchData = useCallback(() => {
    getLoanInfo(loanInfo.loanId.toString()).then((loanInfo) =>
      setLoanInfo(loanInfo),
    );
  }, []);

  return (
    <PageWrapper>
      <PawnShopHeader message={`pawn loan #${loanInfo.loanId}`} />
      {loanInfo == null ? (
        <Dimmer active={loanInfo == null} inverted>
          <Loader inverted content="Loading" />
        </Dimmer>
      ) : (
        <TicketPageBody loanInfo={loanInfo} refresh={fetchData} />
      )}
    </PageWrapper>
  );
};
