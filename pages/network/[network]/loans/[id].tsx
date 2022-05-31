import { GetServerSideProps } from 'next';
import { Loan } from 'types/Loan';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { loanById } from 'lib/loans/loanById';
import { LoanHeader } from 'components/LoanHeader';
import { LoanInfo } from 'components/LoanInfo';
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
import { PawnShopHeader } from 'components/PawnShopHeader';
import Head from 'next/head';
import { captureException } from '@sentry/nextjs';
import { configs, SupportedNetwork, validateNetwork } from 'lib/config';
import { useConfig } from 'hooks/useConfig';
import { OpenGraph } from 'components/OpenGraph';
import { getMetadata } from 'pages/api/network/[network]/nftInfo/[contractAddress]/[tokenId]';
import { NFTResponseData, supportedMedia } from 'lib/getNFTInfo';
import capitalize from 'lodash/capitalize';
import { useAccount, useSigner } from 'wagmi';

export type LoanPageProps = {
  loanInfoJson: string;
  collateralSaleInfo: CollateralSaleInfo;
  metadata: string;
  fallback: {
    [key: string]: any;
  };
};

export const getServerSideProps: GetServerSideProps<LoanPageProps> = async (
  context,
) => {
  try {
    validateNetwork(context.params!);
  } catch (e) {
    captureException(e);
    return {
      notFound: true,
    };
  }
  const id = context.params?.id as string;
  const network = context.params?.network as SupportedNetwork;
  const config = configs[network];
  const [loan, history] = await Promise.all([
    loanById(
      id,
      config.nftBackedLoansSubgraph,
      config.jsonRpcProvider,
      network,
    ),
    subgraphLoanHistoryById(id, config.nftBackedLoansSubgraph),
  ]);

  // The Graph didn't have loan, and fallback call errored.
  if (!loan) {
    return {
      notFound: true,
    };
  }

  const metadata = await getMetadata(
    network,
    loan.collateralContractAddress,
    loan.collateralTokenId,
  );

  const loanInfoJson = JSON.stringify(loan);
  const historyJson = JSON.stringify(history);

  return {
    props: {
      loanInfoJson,
      collateralSaleInfo: await getCollateralSaleInfo(
        loan.collateralContractAddress,
        loan.collateralTokenId.toString(),
        config.nftSalesSubgraph,
        network,
        config.jsonRpcProvider,
      ),
      metadata: JSON.stringify(metadata),
      fallback: {
        [`/api/network/${network}/loans/history/${id}`]: historyJson,
      },
    },
  };
};

export default function Loans({
  loanInfoJson,
  fallback,
  collateralSaleInfo,
  metadata,
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
  const parsedMetadata = useMemo(
    () => parseSerializedResponse(metadata) as NFTResponseData,
    [metadata],
  );

  return (
    <SWRConfig value={{ fallback: parsedFallback }}>
      <LoansInner
        serverLoan={serverLoan}
        collateralSaleInfo={collateralSaleInfo}
        metadata={parsedMetadata}
      />
    </SWRConfig>
  );
}

function LoansInner({
  serverLoan,
  collateralSaleInfo,
  metadata,
}: {
  serverLoan: Loan;
  collateralSaleInfo: CollateralSaleInfo;
  metadata: NFTResponseData;
}) {
  const { jsonRpcProvider, network } = useConfig();
  const { mutate } = useSWRConfig();
  const [loan, setLoan] = useState(serverLoan);
  const { data: account } = useAccount();
  const { data: signer } = useSigner();

  console.log({ account, signer });

  const refresh = useCallback(() => {
    mutate(`/api/network/${network}/loans/history/${loan.id}`);
    nodeLoanById(
      loan.id.toString(),
      jsonRpcProvider,
      network as SupportedNetwork,
    ).then((loan) => {
      if (loan) {
        setLoan(loan);
      }
    });
  }, [jsonRpcProvider, loan.id, mutate, network]);

  const router = useRouter();
  const { addMessage } = useGlobalMessages();

  useEffect(() => {
    const { newLoan } = router.query;

    if (newLoan) {
      addMessage({
        kind: 'success',
        message: (
          <p>
            You&apos;ve successfully created loan #{loan.id.toString()}! To get
            notifications on its activity, go to the{' '}
            <Link href={`/network/${network}/profile/${loan.borrower}`}>
              <a>profile page</a>
            </Link>{' '}
            of address{' '}
            <span title={loan.borrower}>
              {loan.borrower.substring(0, 7)}...
            </span>
          </p>
        ),
      });
      router.replace(
        `/network/${network}/loans/${loan.id.toString()}`,
        undefined,
        {
          shallow: true,
        },
      );
    }
  }, [
    addMessage,
    loan.borrower,
    loan.id,
    network,
    router,
    router.query.newLoan,
  ]);

  const title = useMemo(() => {
    if (metadata) {
      return `Backed | ${capitalize(network)} | ${metadata.name}`;
    }
    return `Backed | ${network} | Loan #${loan.id.toString()}`;
  }, [loan.id, metadata, network]);
  const description = useMemo(() => {
    let status = 'awaiting lender.';
    if (loan.closed) {
      status = 'loan closed.';
    } else if (loan.lender) {
      status = 'accruing interest.';
    }
    return `View loan #${loan.id.toString()}, ${status}`;
  }, [loan.closed, loan.id, loan.lender]);

  const media = useMemo(() => {
    try {
      return supportedMedia(metadata);
    } catch (e) {
      return null;
    }
  }, [metadata]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta
          name="description"
          content={`View ${
            metadata?.name
          } loan #${loan.id.toString()} on Backed protocol`}
        />
      </Head>
      {!!metadata && !!metadata.image && (
        <OpenGraph
          title={title}
          description={description}
          imageUrl={metadata.image!.mediaUrl}
        />
      )}
      <PawnShopHeader />
      <LoanHeader loan={loan} collateralMedia={media} refresh={refresh} />
      <LoanInfo loan={loan} collateralSaleInfo={collateralSaleInfo} />
    </>
  );
}
