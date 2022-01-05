import { Button } from 'components/Button';
import { ethers } from 'ethers';
import { Loan } from 'lib/types/Loan';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './LoanForm.module.css';
import { useWeb3 } from 'hooks/useWeb3';
import { ConnectWallet } from 'components/ConnectWallet';
import {
  getAccountLoanAssetAllowance,
  getAccountLoanAssetBalance,
} from 'lib/account';
import { LoanFormAwaiting } from './LoanFormAwaiting';
import { useTimestamp } from 'hooks/useTimestamp';
import { LoanFormBetterTerms } from './LoanFormBetterTerms';

type LoanFormProps = {
  loan: Loan;
  refresh: () => void;
};
export function LoanForm({ loan, refresh }: LoanFormProps) {
  const { account } = useWeb3();
  const timestamp = useTimestamp();
  const [formOpen, setFormOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [needsAllowance, setNeedsAllowance] = useState(true);
  const toggleForm = useCallback(() => setFormOpen((prev) => !prev), []);
  const buttonText = useMemo(() => {
    if (loan.lastAccumulatedTimestamp.eq(0)) {
      return 'Lend against this NFT';
    }
    return 'Lend with better terms';
  }, [loan.lastAccumulatedTimestamp]);

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
    return (
      <div className={styles.form}>
        <ConnectWallet />
      </div>
    );
  }

  if (
    loan.lastAccumulatedTimestamp.add(loan.durationSeconds).lte(timestamp || 0)
  ) {
    return <span>This loan is past due</span>;
  }

  // if (account.toUpperCase() === loan.lender?.toUpperCase()) {
  //   return null;
  // }

  if (!formOpen) {
    return (
      <div className={styles.form}>
        <Button onClick={toggleForm}>{buttonText}</Button>
      </div>
    );
  }

  if (loan.lastAccumulatedTimestamp.eq(0)) {
    return (
      <LoanFormAwaiting
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
      balance={balance}
      needsAllowance={needsAllowance}
      setNeedsAllowance={setNeedsAllowance}
      refresh={refresh}
    />
  );
}
