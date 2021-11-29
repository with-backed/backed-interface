import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ethers } from 'ethers';
import CollateralMediaCard from 'components/ticketPage/CollateralMediaCard';
import { PawnLoanArt, PawnTicketArt } from 'components/ticketPage/PawnArt';
import { UnderwriteCard } from 'components/ticketPage/UnderwriteCard';
import { LoanInfo } from 'lib/LoanInfoType';
import { RepayCard } from 'components/ticketPage/RepayCard';
import { TicketHistory } from 'components/ticketPage/TicketHistory';
import SeizeCollateralCard from 'components/ticketPage/SeizeCollateralCard';
import { jsonRpcERC721Contract } from 'lib/contracts';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { Fieldset } from 'components/Fieldset';
import { LoanDurationCard } from 'components/ticketPage/LoanDurationCard';
import { Column } from 'components/Column';
import { AccountContext } from 'context/account';
import { useTimestamp } from 'hooks/useTimestamp';

interface TicketPageBodyProps {
  loanInfo: LoanInfo;
  refresh: () => void;
}

export default function TicketPageBody({
  loanInfo,
  refresh,
}: TicketPageBodyProps) {
  return (
    <ThreeColumn>
      <LeftColumn loanInfo={loanInfo} refresh={refresh} />
      <CenterColumn loanInfo={loanInfo} refresh={refresh} />
      <RightColumn loanInfo={loanInfo} refresh={refresh} />
    </ThreeColumn>
  );
}

function LeftColumn({ loanInfo, refresh }: TicketPageBodyProps) {
  const { account } = useContext(AccountContext);
  const [owner, setOwner] = useState('');

  const getOwner = useCallback(async () => {
    const contract = jsonRpcERC721Contract(
      process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT || '',
    );
    const o = await contract.ownerOf(loanInfo.loanId);
    setOwner(o);
  }, [loanInfo.loanId]);

  useEffect(() => {
    getOwner();
  }, [getOwner]);
  return (
    <Column>
      <BorrowTicket
        title="borrow ticket"
        tokenId={loanInfo.loanId}
        owner={owner}
      />
      {account == null ||
      loanInfo.closed ||
      loanInfo.lastAccumulatedTimestamp.eq(0) ? null : (
        <RepayCard loanInfo={loanInfo} repaySuccessCallback={refresh} />
      )}
      <TicketHistory loanInfo={loanInfo} />
    </Column>
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

function CenterColumn({ loanInfo }: TicketPageBodyProps) {
  return (
    <Column>
      <CollateralMediaCard
        collateralAddress={loanInfo.collateralContractAddress}
        collateralTokenId={loanInfo.collateralTokenId}
      />
      {!loanInfo.lastAccumulatedTimestamp.eq(0) && !loanInfo.closed ? (
        <LoanDurationCard
          lastAccumulatedInterest={loanInfo.lastAccumulatedTimestamp}
          loanDuration={loanInfo.durationSeconds}
        />
      ) : (
        ''
      )}
    </Column>
  );
}

function RightColumn({ loanInfo, refresh }: TicketPageBodyProps) {
  const { account } = useContext(AccountContext);
  const timestamp = useTimestamp();
  const endSeconds = useMemo(() => {
    return Math.floor(
      loanInfo.lastAccumulatedTimestamp
        .add(loanInfo.durationSeconds)
        .toNumber(),
    );
  }, [loanInfo.lastAccumulatedTimestamp, loanInfo.durationSeconds]);

  const [owner, setOwner] = useState('');

  const getOwner = useCallback(async () => {
    if (loanInfo.lastAccumulatedTimestamp.eq(0)) {
      return;
    }
    const contract = jsonRpcERC721Contract(
      process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT || '',
    );
    const o = await contract.ownerOf(loanInfo.loanId);
    setOwner(o);
  }, [loanInfo.lastAccumulatedTimestamp, loanInfo.loanId]);

  useEffect(() => {
    getOwner();
  }, [getOwner]);

  return (
    <Column>
      {!loanInfo.lastAccumulatedTimestamp.eq(0) && (
        <LendTicket
          title="lend ticket"
          tokenId={loanInfo.loanId}
          owner={owner}
        />
      )}
      {Boolean(account) && !loanInfo.closed && (
        <>
          {loanInfo.loanOwner != account ||
          timestamp == null ||
          timestamp < endSeconds ? null : (
            <SeizeCollateralCard
              loanInfo={loanInfo}
              seizeCollateralSuccessCallback={refresh}
            />
          )}
          <UnderwriteCard loanInfo={loanInfo} loanUpdatedCallback={refresh} />
        </>
      )}
    </Column>
  );
}
