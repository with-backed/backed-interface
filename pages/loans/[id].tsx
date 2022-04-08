import { GetServerSideProps } from 'next';
import { Loan } from 'types/Loan';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { loanById } from 'lib/loans/loanById';
import { LoanHeader } from 'components/LoanHeader';
import { LoanInfo } from 'components/LoanInfo';
import { CollateralMedia } from 'types/CollateralMedia';
import { getNFTInfoFromTokenInfo } from 'lib/getNFTInfo';
import { nodeLoanById } from 'lib/loans/node/nodeLoanById';
import { subgraphLoanHistoryById } from 'lib/loans/subgraph/subgraphLoanEventsById';
import {
  CollateralSaleInfo,
  getCollateralSaleInfo,
} from 'lib/loans/collateralSaleInfo';
import { SWRConfig, useSWRConfig } from 'swr';
import { parseSerializedResponse } from 'lib/parseSerializedResponse';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { useRouter } from 'next/router';
import Link from 'next/link';

export type LoanPageProps = {
  loanInfoJson: string;
  collateralSaleInfo: CollateralSaleInfo;
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
  const historyJson = JSON.stringify(history);

  return {
    props: {
      loanInfoJson,
      collateralSaleInfo: await getCollateralSaleInfo(
        loan.collateralContractAddress,
        loan.collateralTokenId.toString(),
      ),
      fallback: {
        [`/api/loans/history/${id}`]: historyJson,
      },
    },
  };
};

export default function Loans({
  loanInfoJson,
  fallback,
  collateralSaleInfo,
}: LoanPageProps) {
  const serverLoan = useMemo(
    () => parseSerializedResponse(loanInfoJson) as Loan,
    [loanInfoJson],
  );
  const parsedFallback = useMemo(() => {
    const result: { [key: string]: any } = {};
    Object.keys(fallback).forEach((key) => {
      result[key] = parseSerializedResponse(fallback[key]);
    });
    return result;
  }, [fallback]);

  return (
    <SWRConfig value={{ fallback: parsedFallback }}>
      <LoansInner
        serverLoan={serverLoan}
        collateralSaleInfo={collateralSaleInfo}
      />
    </SWRConfig>
  );
}

function LoansInner({
  serverLoan,
  collateralSaleInfo,
}: {
  serverLoan: Loan;
  collateralSaleInfo: CollateralSaleInfo;
}) {
  const { mutate } = useSWRConfig();
  const [loan, setLoan] = useState(serverLoan);
  const [collateralMedia, setCollateralMedia] =
    useState<CollateralMedia | null>(null);

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

  const { query } = useRouter();
  const { addMessage } = useGlobalMessages();

  useEffect(() => {
    const { newLoan } = query;

    async function promptSubscribe() {
      addMessage({
        kind: 'success',
        message: (
          <div>
            <span>{`You've successfully created loan #${loan.id}! To get notifications on its activity, go to the`}</span>
            <Link href={`/profile/${loan.borrower}`}> profile page</Link>{' '}
            <span>{`of address ${loan.borrower.substring(0, 7)}...`}</span>
          </div>
        ),
      });
    }

    if (newLoan) {
      promptSubscribe();
    }
  }, [query.newLoan]);

  return (
    <>
      <LoanHeader
        loan={loan}
        collateralMedia={collateralMedia}
        refresh={refresh}
      />
      <LoanInfo loan={loan} collateralSaleInfo={collateralSaleInfo} />
    </>
  );
}
