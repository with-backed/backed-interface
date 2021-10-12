import { GetServerSideProps } from 'next';
import { ethers } from 'ethers';
import React, { useEffect, useState } from 'react';
import { Dimmer, Loader, Container } from 'semantic-ui-react';
import dynamic from 'next/dynamic';
import { getTicketInfo } from '../lib/tickets';
import NFTPawnShopArtifact from '../contracts/NFTPawnShop.json';
import TicketPageBody from './ticketPage/TicketPageBody';
import PawnShopHeader from './PawnShopHeader';

const ConnectWallet = dynamic(
  () => import('./ConnectWallet'),
  { ssr: false },
);

const _provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER);

const pawnShopContract = new ethers.Contract(
  process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_CONTRACT,
  NFTPawnShopArtifact.abi,
  _provider,
);

export default function Ticket({ ticketID }) {
  const [ticketInfo, setTicketInfo] = useState(null);
  const [account, setAccount] = useState(null);

  const fetchData = async () => {
    setTicketInfo(null);
    console.log('fetching data');
    if (ticketID == null) {
      return;
    }
    const ticketInfo = await getTicketInfo(`${ticketID}`);
    setTicketInfo(ticketInfo);
  };

  useEffect(() => {
    fetchData();
  }, [ticketID]);
  return (
    <div id="ticket-page-wrapper">
      <PawnShopHeader account={account} setAccount={setAccount} message={`pawn loan #${ticketID}`} />
      {ticketInfo == null
        ? (
          <Dimmer active={ticketInfo == null} inverted>
            <Loader inverted content="Loading" />
          </Dimmer>
        )
      	 :		<TicketPageBody account={account} ticketInfo={ticketInfo} refresh={fetchData} />}
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
