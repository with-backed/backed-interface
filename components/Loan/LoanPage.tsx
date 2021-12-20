import React, {
  FunctionComponent,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { loanById } from 'lib/loans/loanById';
import LoanPageBody from 'components/ticketPage/LoanPageBody';
import { Loan } from 'lib/types/Loan';
import { headerMessages, LoanStatus } from 'pawnshopConstants';
import { useTimestamp } from 'hooks/useTimestamp';

type LoanProps = {
  serverLoanInfo: Loan;
};

export const LoanPage: FunctionComponent<LoanProps> = ({ serverLoanInfo }) => {
  const [loan, setLoan] = useState<Loan>(serverLoanInfo);
  const timestamp = useTimestamp();

  const loanStatus: LoanStatus = useMemo(() => {
    if (!timestamp) {
      return 'indeterminate';
    }

    if (
      loan.lastAccumulatedTimestamp.add(loan.durationSeconds).lte(timestamp)
    ) {
      return 'past due';
    }

    return 'active';
  }, [loan.durationSeconds, loan.lastAccumulatedTimestamp, timestamp]);

  const messages = useMemo(
    () => headerMessages.ticket(loan, loanStatus),
    [loan, loanStatus],
  );

  const fetchData = useCallback(() => {
    loanById(loan.id.toString()).then((loan: Loan | null) => {
      if (loan) {
        setLoan(loan);
      }
    });
  }, [loan.id]);

  return <LoanPageBody loan={loan} refresh={fetchData} />;
};
