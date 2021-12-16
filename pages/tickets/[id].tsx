import { GetServerSideProps } from 'next';
import { Loan } from 'components/Ticket';
import { LoanInfo } from 'lib/LoanInfoType';
import { ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';
import { getLoanInfoGraphQL } from 'lib/loan';
import { getNFTInfo, GetNFTInfoResponse } from 'lib/getNFTInfo';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { jsonRpcERC721Contract } from 'lib/contracts';
import { LoanHeader } from 'components/LoanHeader';

export type LoanPageProps = {
  loanInfoJson: string;
};

export const getServerSideProps: GetServerSideProps<LoanPageProps> = async (
  context,
) => {
  const id = context.params?.id as string;
  const loan = await getLoanInfoGraphQL(id);

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
    },
  };
};

export default function Loans({ loanInfoJson }: LoanPageProps) {
  const loanInfo = useMemo(
    () => parseLoanInfoJson(loanInfoJson),
    [loanInfoJson],
  );
  const tokenSpec = useMemo(
    () => ({
      contract: jsonRpcERC721Contract(loanInfo.collateralContractAddress),
      tokenId: loanInfo.collateralTokenId,
    }),
    [loanInfo],
  );
  const { isLoading, metadata } = useTokenMetadata(tokenSpec);
  const collateralMedia = useMemo(() => {
    if (!isLoading && metadata) {
      const { mediaUrl, mediaMimeType } = metadata;
      return {
        mediaUrl,
        mediaMimeType,
      };
    }
    return null;
  }, [isLoading, metadata]);

  return (
    <>
      <LoanHeader collateralMedia={collateralMedia} loanInfo={loanInfo} />
    </>
  );
}

const parseLoanInfoJson = (loanInfoJson: string): LoanInfo => {
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
