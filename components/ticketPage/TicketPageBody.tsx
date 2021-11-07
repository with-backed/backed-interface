import React, { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import CollateralMediaCard from 'components/ticketPage/CollateralMediaCard';
import { PawnLoanArt, PawnTicketArt } from 'components/ticketPage/PawnArt';
import UnderwriteCard from 'components/ticketPage/UnderwriteCard';
import { LoanInfo } from 'lib/LoanInfoType';
import RepayCard from 'components/ticketPage/RepayCard';
import TicketHistory from 'components/ticketPage/TicketHistory';
import SeizeCollateralCard from 'components/ticketPage/SeizeCollateralCard';
import { jsonRpcERC721Contract } from 'lib/contracts';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { Fieldset } from 'components/Fieldset';
import LoanDurationCard from './LoanDurationCard';

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
    <ThreeColumn>
      <LeftColumn account={account} loanInfo={loanInfo} refresh={refresh} />
      <CenterColumn account={account} loanInfo={loanInfo} refresh={refresh} />
      <RightColumn account={account} loanInfo={loanInfo} refresh={refresh} />
    </ThreeColumn>
  );
}

function LeftColumn({ account, loanInfo, refresh }: TicketPageBodyProps) {
  const [owner, setOwner] = useState('');

  const getOwner = useCallback(async () => {
    const contract = jsonRpcERC721Contract(
      process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT,
    );
    const o = await contract.ownerOf(loanInfo.loanId);
    setOwner(o);
  }, [loanInfo.loanId]);

  useEffect(() => {
    getOwner();
  }, [getOwner]);
  return (
    <div id="left-elements-wrapper" className="float-left">
      <BorrowTicket
        title="borrow ticket"
        tokenId={loanInfo.loanId}
        owner={owner}
      />
      {account == null ||
      loanInfo.closed ||
      loanInfo.lastAccumulatedTimestamp.toString() == '0' ||
      owner != account ? (
        ''
      ) : (
        <RepayCard
          account={account}
          loanInfo={loanInfo}
          repaySuccessCallback={refresh}
        />
      )}
      <TicketHistory loanInfo={loanInfo} />
    </div>
  );
}

function BorrowTicket({
  title,
  tokenId,
  owner,
}: {
  title: string;
  tokenId: ethers.BigNumber;
  owner: string;
}) {
  return (
    <Fieldset legend={title}>
      <PawnTicketArt tokenId={tokenId} />
      <p>
        {`Owned by ${owner.slice(0, 10)}...`}
        <br />
        <a
          target="_blank"
          href={`${process.env.NEXT_PUBLIC_OPENSEA_URL}/assets/${
            process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT
          }/${tokenId.toString()}`}
          rel="noreferrer">
          View on OpenSea
        </a>
      </p>
    </Fieldset>
  );
}

function LendTicket({
  title,
  tokenId,
  owner,
}: {
  title: string;
  tokenId: ethers.BigNumber;
  owner: string;
}) {
  return (
    <Fieldset legend={title}>
      <PawnLoanArt tokenId={tokenId} />
      <p>
        {`Owned by ${owner.slice(0, 10)}...`}
        <br />
        <a
          target="_blank"
          href={`${process.env.NEXT_PUBLIC_OPENSEA_URL}/assets/${
            process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT
          }/${tokenId.toString()}`}
          rel="noreferrer">
          View on OpenSea
        </a>
      </p>
    </Fieldset>
  );
}

function CenterColumn({ account, loanInfo, refresh }: TicketPageBodyProps) {
  return (
    <div>
      <CollateralMediaCard
        collateralAddress={loanInfo.collateralContractAddress}
        collateralTokenId={loanInfo.collateralTokenId}
      />
      <LoanDurationCard
        lastAccumulatedInterest={loanInfo.lastAccumulatedTimestamp}
        loanDuration={loanInfo.durationSeconds}
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

  const getOwner = useCallback(async () => {
    if (loanInfo.lastAccumulatedTimestamp.eq(0)) {
      return;
    }
    const contract = jsonRpcERC721Contract(
      process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT,
    );
    const o = await contract.ownerOf(loanInfo.loanId);
    setOwner(o);
  }, [loanInfo.lastAccumulatedTimestamp, loanInfo.loanId]);

  const refreshTimestamp = useCallback(async () => {
    const height = await _provider.getBlockNumber();
    const block = await _provider.getBlock(height);
    setTimestamp(block.timestamp);
    console.log(`timestamp ${block.timestamp}`);
  }, []);

  useEffect(() => {
    getOwner();
    refreshTimestamp();
    const timeOutId = setInterval(() => refreshTimestamp(), 14000);
    return () => clearInterval(timeOutId);
  }, [getOwner, refreshTimestamp]);

  return (
    <div id="right-elements-wrapper" className="float-left">
      {loanInfo.lastAccumulatedTimestamp.eq(0) ? (
        ''
      ) : (
        <LendTicket
          title="lend ticket"
          tokenId={loanInfo.loanId}
          owner={owner}
        />
      )}
      {account == null || loanInfo.closed ? (
        ''
      ) : (
        <div>
          {loanInfo.loanOwner != account ||
          timestamp == null ||
          timestamp < endSeconds ? (
            ''
          ) : (
            <SeizeCollateralCard
              account={account}
              loanInfo={loanInfo}
              seizeCollateralSuccessCallback={refresh}
            />
          )}
          <UnderwriteCard
            account={account}
            loanInfo={loanInfo}
            loanUpdatedCallback={refresh}
          />
        </div>
      )}
    </div>
  );
}
