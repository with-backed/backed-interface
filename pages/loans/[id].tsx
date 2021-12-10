import { GetServerSideProps } from 'next';
import { Loan } from 'components/Ticket';
import { LoanInfo } from 'lib/LoanInfoType';
import { getLoanInfo } from 'lib/loan';
import { nftBackedLoansClient } from 'lib/urql';
import { ethers } from 'ethers';
import { useMemo } from 'react';

const loanPageQuery = `
query ($id: ID!) {
  loan(id: $id) {
    id
    loanAssetContractAddress
    collateralContractAddress
    collateralTokenId
    perSecondInterestRate
    accumulatedInterest
    lastAccumulatedTimestamp
    durationSeconds
    loanAmount
    closed
    loanAssetDecimal
    loanAssetSymbol
    lendTicketHolder
    borrowTicketHolder
  }
}
`;

const bigNumberProperties = [
  'loanId',
  'collateralTokenId',
  'perSecondInterestRate',
  'accumulatedInterest',
  'lastAccumulatedTimestamp',
  'durationSeconds',
  'loanAmount',
];

export type LoanPageProps = {
  loanInfoJson: string | null;
  id: string;
};

export const getServerSideProps: GetServerSideProps<LoanPageProps> = async (
  context,
) => {
  const id = context.params?.id as string;
  const {
    data: { loan },
  } = await nftBackedLoansClient.query(loanPageQuery, { id }).toPromise();
  loan.interestOwed = ethers.BigNumber.from('0');
  loan.loanId = loan.id;
  bigNumberProperties.forEach((prop) => {
    if (loan) {
      if (loan[prop]) {
        loan[prop] = ethers.BigNumber.from(loan[prop]);
      }
    }
  });
  loan.lender = loan.lendTicketHolder;
  loan.borrower = loan.borrowTicketHolder;

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
    () => (loanInfoJson ? parseLoanInfoJson(loanInfoJson) : null),
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
