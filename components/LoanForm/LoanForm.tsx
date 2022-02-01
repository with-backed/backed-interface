import { ethers } from 'ethers';
import { Loan } from 'types/Loan';
import React, { useEffect, useMemo, useState } from 'react';
import { useWeb3 } from 'hooks/useWeb3';
import { ConnectWallet } from 'components/ConnectWallet';
import {
  getAccountLoanAssetAllowance,
  getAccountLoanAssetBalance,
} from 'lib/account';
import { LoanFormAwaiting } from './LoanFormAwaiting';
import { useTimestamp } from 'hooks/useTimestamp';
import { LoanFormBetterTerms } from './LoanFormBetterTerms';
import { LoanFormRepay } from './LoanFormRepay';
import { LoanFormEarlyClosure } from './LoanFormEarlyClosure';
import { LoanFormSeizeCollateral } from './LoanFormSeizeCollateral';
import { UseFormReturn } from 'react-hook-form';
import { LoanFormData } from './LoanFormData';
import { Form } from 'components/Form';

type LoanFormProps = {
  form: UseFormReturn<LoanFormData>;
  loan: Loan;
  refresh: () => void;
};
export function LoanForm({ form, loan, refresh }: LoanFormProps) {
  const { account } = useWeb3();
  const timestamp = useTimestamp();
  const [balance, setBalance] = useState(0);
  const [needsAllowance, setNeedsAllowance] = useState(true);
  const viewerIsBorrower = useMemo(
    () => account?.toUpperCase() === loan.borrower.toUpperCase(),
    [account, loan.borrower],
  );

  useEffect(() => {
    if (account) {
      Promise.all([
        getAccountLoanAssetBalance(
          account,
          loan.loanAssetContractAddress,
          ethers.BigNumber.from(loan.loanAssetDecimals),
        ),
        getAccountLoanAssetAllowance(account, loan.loanAssetContractAddress),
      ]).then(([balance, allowanceAmount]) => {
        setBalance(balance);
        setNeedsAllowance(allowanceAmount.lt(loan.loanAmount));
      });
    }
  }, [
    account,
    loan.loanAssetContractAddress,
    loan.loanAssetDecimals,
    loan.loanAmount,
  ]);

  if (loan.closed) {
    return null;
  }

  if (!account) {
    return <ConnectWallet />;
  }

  if (
    !loan.lastAccumulatedTimestamp.eq(0) &&
    loan.lastAccumulatedTimestamp
      .add(loan.durationSeconds)
      .lte(timestamp || 0) &&
    account.toLowerCase() === loan.lender?.toLowerCase()
  ) {
    if (account.toUpperCase() === loan.lender?.toUpperCase()) {
      return <LoanFormSeizeCollateral loan={loan} refresh={refresh} />;
    }
    return null;
  }

  if (
    loan.lastAccumulatedTimestamp.eq(0) &&
    account.toUpperCase() === loan.borrower.toUpperCase()
  ) {
    return <LoanFormEarlyClosure loan={loan} refresh={refresh} />;
  }

  if (loan.lastAccumulatedTimestamp.eq(0)) {
    return (
      <LoanFormAwaiting
        loan={loan}
        form={form}
        needsAllowance={needsAllowance}
        setNeedsAllowance={setNeedsAllowance}
        refresh={refresh}
      />
    );
  }

  if (viewerIsBorrower) {
    return (
      <LoanFormRepay
        loan={loan}
        balance={balance}
        needsAllowance={needsAllowance}
        setNeedsAllowance={setNeedsAllowance}
        refresh={refresh}
      />
    );
  }

  return (
    <LoanFormBetterTerms
      loan={loan}
      form={form}
      needsAllowance={needsAllowance}
      setNeedsAllowance={setNeedsAllowance}
      refresh={refresh}
    />
  );
}
