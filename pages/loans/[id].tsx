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
import { SWRConfig, useSWRConfig } from 'swr';

export type LoanPageProps = {
  loanInfoJson: string;
  fallback: {
    [key: string]: any;
  };
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
  return {
    props: {
      loanInfoJson,
      fallback: {
        [`/api/loans/history/${id}`]: history,
      },
    },
  };
};

export default function Loans({ loanInfoJson, fallback }: LoanPageProps) {
  const serverLoan = useMemo(
    () => parseLoanInfoJson(loanInfoJson),
    [loanInfoJson],
  );

  return (
    <SWRConfig value={{ fallback }}>
      <LoansInner serverLoan={serverLoan} />
    </SWRConfig>
  );
}

function LoansInner({ serverLoan }: { serverLoan: Loan }) {
  const [loan, setLoan] = useState(serverLoan);
  const [collateralMedia, setCollateralMedia] =
    useState<CollateralMedia | null>(null);
  const { mutate } = useSWRConfig();

  const refresh = useCallback(() => {
    mutate(`/api/loans/history/${loan.id}`);
    nodeLoanById(loan.id.toString()).then((loan) => {
      if (loan) {
        setLoan(loan);
      }
    });
  }, [loan.id, mutate]);

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
      <button onClick={refresh}>Refresh</button>
      <LoanInfo loan={loan} />
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
