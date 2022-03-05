import { Loan } from '../../types/Loan';
import { useMemo } from 'react';

export const useLoanViewerRole = (loan: Loan, account?: string | null) =>
  useMemo(() => {
    if (!account) {
      return null;
    } else if (account.toUpperCase() === loan.lender?.toUpperCase()) {
      return 'lender';
    } else if (account.toUpperCase() === loan.borrower.toUpperCase()) {
      return 'borrower';
    }
    return null;
  }, [account, loan.lender, loan.borrower]);
