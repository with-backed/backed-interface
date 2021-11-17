import { GetServerSideProps } from 'next';
import { Loan } from 'components/Ticket';
import { LoanInfo } from 'lib/LoanInfoType';
import { getLoanInfo } from 'lib/loan';
import { ethers } from 'ethers';

export type LoanPageProps = {
  loanInfoJson: string;
};

export const getServerSideProps: GetServerSideProps<LoanPageProps> = async (
  context,
) => {
  const id = context.params?.id as string;
  const loanInfo = await getLoanInfo(id);
  const loanInfoJson = JSON.stringify(loanInfo);
  return {
    props: {
      loanInfoJson,
    },
  };
};

export default function Loans({ loanInfoJson }: LoanPageProps) {
  const loanInfo = JSON.parse(loanInfoJson);
  Object.keys(loanInfo).forEach((k: string) => {
    if (loanInfo[k]['hex'] != null) {
      loanInfo[k] = ethers.BigNumber.from(loanInfo[k]['hex']);
    }
  });

  return <Loan serverLoanInfo={loanInfo as LoanInfo} />;
}
