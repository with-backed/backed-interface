import { Loan } from '../../types/Loan';
import { useMemo } from 'react';

export const useLoanViewerRole = (loan: Loan, account?: string | null) =>
  useMemo(() => {
    switch (account?.toUpperCase()) {
      case loan.borrower.toUpperCase():
        return 'borrower';
      case loan.lender?.toUpperCase():
        return 'lender';
      default:
        return null;
    }
  }, [account, loan.lender, loan.borrower]);
