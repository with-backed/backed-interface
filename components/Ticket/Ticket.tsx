import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';
import { getLoanInfo } from 'lib/loan';
import TicketPageBody from 'components/ticketPage/TicketPageBody';
import PawnShopHeader from 'components/PawnShopHeader';
import { PageWrapper } from 'components/layouts/PageWrapper';

type TicketProps = {
  ticketID: string | null;
}

export const Ticket: FunctionComponent<TicketProps> = ({ ticketID }) => {
  const [loanInfo, setLoanInfo] = useState(null);
  const [account, setAccount] = useState(null);
  
  const fetchData = useCallback(() => {
    setLoanInfo(null);
    if (ticketID == null) {
      return;
    }
    getLoanInfo(`${ticketID}`).then(loanInfo => setLoanInfo(loanInfo));
  }, [ticketID]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <PageWrapper>
      <PawnShopHeader
        account={account}
        setAccount={setAccount}
        message={`pawn loan #${ticketID}`}
      />
      {loanInfo == null ? (
        <Dimmer active={loanInfo == null} inverted>
          <Loader inverted content="Loading" />
        </Dimmer>
      ) : (
        <TicketPageBody
          account={account}
          loanInfo={loanInfo}
          refresh={fetchData}
        />
      )}
    </PageWrapper>
  );
}
