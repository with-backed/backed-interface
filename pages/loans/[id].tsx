import { GetServerSideProps } from 'next';
import { Loan } from 'lib/types/Loan';
import { ethers } from 'ethers';
import React, { useMemo, useState } from 'react';
import { loanById } from 'lib/loans/loanById';
import { LoanPage } from 'components/Loan/LoanPage';
import { LoanHeader } from 'components/LoanHeader';
import { LoanInfo } from 'components/LoanInfo';
import { CollateralMedia } from 'lib/types/CollateralMedia';

export type LoanPageProps = {
  loanInfoJson: string;
};

export const getServerSideProps: GetServerSideProps<LoanPageProps> = async (
  context,
) => {
  const id = context.params?.id as string;
  const loan = await loanById(id);

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
  const loan = useMemo(() => parseLoanInfoJson(loanInfoJson), [loanInfoJson]);
  const [collateralMedia, setCollateralMedia] =
    useState<CollateralMedia | null>(null);

  return (
    <>
      <LoanHeader loan={loan} collateralMedia={collateralMedia} />
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
