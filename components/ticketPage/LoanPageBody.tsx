import React, { useMemo } from 'react';
import { ethers } from 'ethers';
import CollateralMediaCard from 'components/ticketPage/CollateralMediaCard';
import { PawnLoanArt, PawnTicketArt } from 'components/ticketPage/PawnArt';
import { UnderwriteCard } from 'components/ticketPage/UnderwriteCard';
import { Loan } from 'types/Loan';
import { RepayCard } from 'components/ticketPage/RepayCard';
import { TicketHistory } from 'components/ticketPage/TicketHistory';
import SeizeCollateralCard from 'components/ticketPage/SeizeCollateralCard';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { Fieldset } from 'components/Fieldset';
import { LoanDurationCard } from 'components/ticketPage/LoanDurationCard';
import { Column } from 'components/Column';
import { useTimestamp } from 'hooks/useTimestamp';
import { useWeb3 } from 'hooks/useWeb3';

interface LoanPageBodyProps {
  loan: Loan;
  refresh: () => void;
}

export default function LoanPageBody({ loan, refresh }: LoanPageBodyProps) {
  return (
    <ThreeColumn>
      <LeftColumn loan={loan} refresh={refresh} />
      <CenterColumn loan={loan} refresh={refresh} />
      <RightColumn loan={loan} refresh={refresh} />
    </ThreeColumn>
  );
}

function LeftColumn({ loan, refresh }: LoanPageBodyProps) {
  const { account } = useWeb3();
  const owner = loan.borrower;
  return (
    <Column>
      <BorrowTicket title="borrow ticket" tokenId={loan.id} owner={owner} />
      {account == null ||
      loan.closed ||
      loan.lastAccumulatedTimestamp.eq(0) ? null : (
        <RepayCard loanInfo={loan} repaySuccessCallback={refresh} />
      )}
      <TicketHistory loanInfo={loan} />
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

function CenterColumn({ loan }: LoanPageBodyProps) {
  return (
    <Column>
      <CollateralMediaCard
        collateralAddress={loan.collateralContractAddress}
        collateralTokenId={loan.collateralTokenId}
      />
      {!loan.lastAccumulatedTimestamp.eq(0) && !loan.closed && (
        <LoanDurationCard
          lastAccumulatedInterest={loan.lastAccumulatedTimestamp}
          loanDuration={loan.durationSeconds}
        />
      )}
    </Column>
  );
}

function RightColumn({ loan, refresh }: LoanPageBodyProps) {
  const { account } = useWeb3();
  const timestamp = useTimestamp();
  const endSeconds = useMemo(() => {
    return Math.floor(
      loan.lastAccumulatedTimestamp.add(loan.durationSeconds).toNumber(),
    );
  }, [loan.lastAccumulatedTimestamp, loan.durationSeconds]);

  return (
    <Column>
      {loan.lender && (
        <LendTicket title="lend ticket" tokenId={loan.id} owner={loan.lender} />
      )}
      {Boolean(account) && !loan.closed && (
        <>
          {loan.lender != account ||
          timestamp == null ||
          timestamp < endSeconds ? null : (
            <SeizeCollateralCard
              loanInfo={loan}
              seizeCollateralSuccessCallback={refresh}
            />
          )}
          <UnderwriteCard loanInfo={loan} loanUpdatedCallback={refresh} />
        </>
      )}
    </Column>
  );
}
