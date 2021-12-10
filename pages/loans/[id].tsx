import { GetServerSideProps } from 'next';
import { Loan } from 'components/Ticket';
import { LoanInfo } from 'lib/LoanInfoType';

import { ethers } from 'ethers';
import { useMemo } from 'react';
import { getLoanInfoGraphQL } from 'lib/loan';

export type LoanPageProps = {
  loanInfoJson: string;
  id: string;
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
      id,
    },
  };
};

export default function Loans({ loanInfoJson, id }: LoanPageProps) {
  const loanInfo = useMemo(
    () => parseLoanInfoJson(loanInfoJson),
    [loanInfoJson],
  );

  return <Loan serverLoanInfo={loanInfo} loanId={id} />;
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
