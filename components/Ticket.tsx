import { GetServerSideProps } from 'next';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { Dimmer, Loader, Container } from 'semantic-ui-react';
import dynamic from 'next/dynamic';
import { getLoanInfo } from '../lib/loan';
import TicketPageBody from './ticketPage/TicketPageBody';
import PawnShopHeader from './PawnShopHeader';

const ConnectWallet = dynamic(() => import('./ConnectWallet'), { ssr: false });

export default function Ticket({ ticketID }) {
  const [loanInfo, setLoanInfo] = useState(null);
  const [account, setAccount] = useState(null);

  const fetchData = async () => {
    setLoanInfo(null);
    console.log('fetching data');
    if (ticketID == null) {
      return;
    }
    const loanInfo = await getLoanInfo(`${ticketID}`);
    setLoanInfo(loanInfo);
  };

  useEffect(() => {
    fetchData();
  }, [ticketID]);
  return (
    <div id="ticket-page-wrapper">
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
    </div>
  );
}

function LoadingOverlay({ txHash }) {
  return (
    <div id="loading-box">
      Tx is loading
      <style jsx>
        {`
          #loading-box {
            display: ${txHash == '' ? 'none' : 'normal'};
          }
        `}
      </style>
    </div>
  );
}
