import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import CollateralMediaCard from './CollateralMediaCard';
import { PawnLoanArt, PawnTicketArt } from './PawnArt';
import UnderwriteCard from './UnderwriteCard';
import { getLoanInfo } from '../../lib/loan';
import { LoanInfo } from '../../lib/LoanInfoType';
import RepayCard from './RepayCard';
import TicketHistory from './TicketHistory';
import SeizeCollateralCard from './SeizeCollateralCard';
import { erc721Contract, jsonRpcERC721Contract } from '../../lib/contracts';

const _provider = new ethers.providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER,
);

interface TicketPageBodyProps {
  account: string;
  loanInfo: LoanInfo;
  refresh: () => void;
}

export default function TicketPageBody({
  account,
  loanInfo,
  refresh,
}: TicketPageBodyProps) {
  return (
    <div id="ticket-page">
      <LeftColumn account={account} loanInfo={loanInfo} refresh={refresh} />
      <div className="float-left">
        <CollateralMediaCard
          collateralAddress={loanInfo.collateralContractAddress}
          collateralTokenId={loanInfo.collateralTokenId}
        />
      </div>
      <RightColumn
        account={account}
        loanInfo={loanInfo}
        refresh={refresh}
      />
    </div>
  );
}

function LeftColumn({ account, loanInfo, refresh }: TicketPageBodyProps) {
  const [owner, setOwner] = useState('');

  const getOwner = async () => {
    const contract = jsonRpcERC721Contract(
      process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT,
    );
    const o = await contract.ownerOf(
      loanInfo.loanId,
    );
    setOwner(o);
  };

  useEffect(() => {
    getOwner();
  });
  return (
    <div id="left-elements-wrapper" className="float-left">
      <fieldset className="standard-fieldset">
        <legend>pawn ticket</legend>
        <p>
          {' '}
          This Pawn Ticket NFT is owned by
          {owner.slice(0, 10)}
          ...
          <br />
          <a
            target="_blank"
            href={`${process.env.NEXT_PUBLIC_OPENSEA_URL}/assets/${process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT}/${loanInfo.loanId.toString()}`}
            rel="noreferrer"
          >
            View on OpenSea
          </a>
        </p>
      </fieldset>

      <div>
        {' '}
        <PawnTicketArt tokenId={loanInfo.loanId} />
        {' '}
      </div>
      {account == null
      || loanInfo.closed
      || loanInfo.lastAccumulatedTimestamp.toString() == '0'
      || owner != account ? (
          ''
        ) : (
          <RepayCard
            account={account}
            loanInfo={loanInfo}
            repaySuccessCallback={refresh}
          />
        )}
      <TicketHistory
        loanInfo={loanInfo}
      />
    </div>
  );
}

function RightColumn({ account, loanInfo, refresh }: TicketPageBodyProps) {
  const [timestamp, setTimestamp] = useState(null);
  const [endSeconds] = useState(
    parseInt(
      loanInfo.lastAccumulatedTimestamp
        .add(loanInfo.durationSeconds)
        .toString(),
    ),
  );
  const [owner, setOwner] = useState('');

  const getOwner = async () => {
    const contract = jsonRpcERC721Contract(
      process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT,
    );
    const o = await contract.ownerOf(
      loanInfo.loanId,
    );
    setOwner(o);
  };

  const refreshTimestamp = async () => {
    const height = await _provider.getBlockNumber();
    const block = await _provider.getBlock(height);
    setTimestamp(block.timestamp);
    console.log(`timestamp ${block.timestamp}`);
  };

  useEffect(() => {
    getOwner();
    refreshTimestamp();
    const timeOutId = setInterval(() => refreshTimestamp(), 14000);
    return () => clearInterval(timeOutId);
  }, [loanInfo]);

  return (
    <div id="right-elements-wrapper" className="float-left">
      {loanInfo.lastAccumulatedTimestamp.toString() == '0' ? (
        ''
      ) : (
        <div>
          <fieldset className="standard-fieldset">
            <legend>pawn loan</legend>
            <p>
              {' '}
              This Pawn Loan NFT is owned by
              {owner.slice(0, 10)}
              ...
              <br />
              <a
                target="_blank"
                href={`${process.env.NEXT_PUBLIC_OPENSEA_URL}/assets/${process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT}/${loanInfo.loanId.toString()}`}
                rel="noreferrer"
              >
                View on OpenSea
              </a>
            </p>
          </fieldset>
          <div id="pawn-loan-art">
            {' '}
            <PawnLoanArt tokenId={loanInfo.loanId} />
            {' '}
          </div>
        </div>
      )}
      {account == null || loanInfo.closed ? (
        ''
      ) : (
        <div>
          <UnderwriteCard
            account={account}
            loanInfo={loanInfo}
            loanUpdatedCallback={refresh}
          />
          {loanInfo.loanOwner != account
          || timestamp == null
          || timestamp < endSeconds ? (
              ''
            ) : (
              <SeizeCollateralCard
                account={account}
                loanInfo={loanInfo}
                seizeCollateralSuccessCallback={refresh}
              />
            )}
        </div>
      )}
    </div>
  );
}
