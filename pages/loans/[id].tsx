import { GetServerSideProps } from 'next';
import { Loan } from 'types/Loan';
import { ethers } from 'ethers';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { loanById } from 'lib/loans/loanById';
import { LoanHeader } from 'components/LoanHeader';
import { LoanInfo } from 'components/LoanInfo';
import { CollateralMedia } from 'types/CollateralMedia';
import { getNFTInfoFromTokenInfo } from 'lib/getNFTInfo';
import { nodeLoanById } from 'lib/loans/node/nodeLoanById';
import { subgraphLoanHistoryById } from 'lib/loans/subgraph/subgraphLoanEventsById';
import { Event } from 'types/Event';

export type LoanPageProps = {
  loanInfoJson: string;
  historyJson: string;
};

export const getServerSideProps: GetServerSideProps<LoanPageProps> = async (
  context,
) => {
  const id = context.params?.id as string;
  const [loan, history] = await Promise.all([
    loanById(id),
    subgraphLoanHistoryById(id),
  ]);

  // The Graph didn't have loan, and fallback call errored.
  if (!loan) {
    return {
      notFound: true,
    };
  }

  const loanInfoJson = JSON.stringify(loan);
  const historyJson = JSON.stringify(history);
  return {
    props: {
      loanInfoJson,
      historyJson,
    },
  };
};

export default function Loans({ loanInfoJson, historyJson }: LoanPageProps) {
  const serverLoan = useMemo(
    () => parseLoanInfoJson(loanInfoJson),
    [loanInfoJson],
  );
  const serverEvents = useMemo(
    () => parseHistoryJson(historyJson),
    [historyJson],
  );
  const [loan, setLoan] = useState(serverLoan);
  const [collateralMedia, setCollateralMedia] =
    useState<CollateralMedia | null>(null);

  const refresh = useCallback(() => {
    nodeLoanById(loan.id.toString()).then((loan) => {
      if (loan) {
        setLoan(loan);
      }
    });
  }, [loan.id]);

  useEffect(() => {
    getNFTInfoFromTokenInfo(
      loan.collateralTokenId,
      loan.collateralTokenURI,
    ).then((response) => {
      if (response) {
        const { mediaMimeType, mediaUrl } = response;
        setCollateralMedia({ mediaMimeType, mediaUrl });
      }
    });
  }, [loan.collateralTokenURI, loan.collateralTokenId]);

  return (
    <>
      <LoanHeader
        loan={loan}
        collateralMedia={collateralMedia}
        refresh={refresh}
      />
      <LoanInfo loan={loan} events={serverEvents} />
    </>
  );
}

const parseLoanInfoJson = (loanInfoJson: string): Loan => {
  const loanInfo = JSON.parse(loanInfoJson);
  Object.keys(loanInfo).forEach((k: string) => {
    if (loanInfo[k] == null) {
      return;
    }

    if (loanInfo[k]['hex'] != null) {
      loanInfo[k] = ethers.BigNumber.from(loanInfo[k]['hex']);
    }
  });
  return loanInfo;
};

const parseHistoryJson = (historyJson: string): Event[] => {
  const events = JSON.parse(historyJson);
  return events;
};
