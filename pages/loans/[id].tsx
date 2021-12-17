import { GetServerSideProps } from 'next';
import { Loan } from 'components/Ticket';
import { LoanInfo } from 'lib/LoanInfoType';
import { ethers } from 'ethers';
import { useMemo } from 'react';
import { getLoanInfoGraphQL } from 'lib/loan';
import { PageWrapper } from 'components/layouts/PageWrapper';

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

  return (
    <PageWrapper>
      <Loan serverLoanInfo={loanInfo} />
    </PageWrapper>
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
