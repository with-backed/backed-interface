import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { loanById } from 'lib/loans/loanById';
import LoanPageBody from 'components/ticketPage/LoanPageBody';
import { Loan } from 'lib/types/Loan';

type LoanProps = {
  serverLoanInfo: Loan;
};

export const LoanPage: FunctionComponent<LoanProps> = ({ serverLoanInfo }) => {
  const [loan, setLoan] = useState<Loan>(serverLoanInfo);

  const fetchData = useCallback(() => {
    loanById(loan.id.toString()).then((loan: Loan | null) => {
      if (loan) {
        setLoan(loan);
      }
    });
  }, [loan.id]);

  return <LoanPageBody loan={loan} refresh={fetchData} />;
};
