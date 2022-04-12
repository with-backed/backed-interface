import { ethers } from 'ethers';
import { Loan } from 'types/Loan';
import React, { useEffect, useMemo, useState } from 'react';
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
import styles from './LoanForm.module.css';
import { Button } from 'components/Button';
import { useLoanViewerRole } from 'hooks/useLoanViewerRole';
import { LoanFormDisclosure } from './LoanFormDisclosure';
import { useAccount } from 'wagmi';
import { LoanOfferBetterTermsDisclosure } from 'components/LoanForm/LoanOfferBetterTermsDisclosure';

type LoanFormProps = {
  loan: Loan;
  refresh: () => void;
};
export function LoanForm({ loan, refresh }: LoanFormProps) {
  const [{ data }] = useAccount();
  const account = data?.address;

  const timestamp = useTimestamp();
  const [balance, setBalance] = useState(0);
  const [needsAllowance, setNeedsAllowance] = useState(true);
  const role = useLoanViewerRole(loan, account);
  const viewerIsBorrower = role === 'borrower';
  const viewerIsLender = role === 'lender';

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
      <div className={styles.wrapper}>
        <Button disabled>{loan.lender ? 'Offer better terms' : 'Lend'}</Button>
      </div>
    );
  }

  if (
    !loan.lastAccumulatedTimestamp.eq(0) &&
    loan.lastAccumulatedTimestamp
      .add(loan.durationSeconds)
      .lte(timestamp || 0) &&
    viewerIsLender
  ) {
    if (viewerIsLender) {
      return (
        <div className={styles.wrapper}>
          <LoanFormSeizeCollateral loan={loan} refresh={refresh} />
        </div>
      );
    }
    return null;
  }

  if (loan.lastAccumulatedTimestamp.eq(0) && viewerIsBorrower) {
    return (
      <div className={styles.wrapper}>
        <LoanFormEarlyClosure loan={loan} refresh={refresh} />
      </div>
    );
  }

  if (loan.lastAccumulatedTimestamp.eq(0)) {
    return (
      <LoanFormDisclosure title={'Lend'} className={styles.wrapper}>
        <div className={styles['form-wrapper']}>
          <LoanFormAwaiting
            balance={balance}
            loan={loan}
            needsAllowance={needsAllowance}
            setNeedsAllowance={setNeedsAllowance}
            refresh={refresh}
          />
        </div>
      </LoanFormDisclosure>
    );
  }

  if (viewerIsBorrower) {
    return (
      <LoanFormDisclosure
        title={'Repay loan & Claim NFT'}
        className={styles.wrapper}>
        <div className={styles['form-wrapper']}>
          <LoanFormRepay
            loan={loan}
            balance={balance}
            needsAllowance={needsAllowance}
            setNeedsAllowance={setNeedsAllowance}
            refresh={refresh}
          />
        </div>
      </LoanFormDisclosure>
    );
  }

  return (
    <LoanOfferBetterTermsDisclosure
      textWrapperClassName={styles['disclosure-text-wrapper']}
      disclosureTextClassName={styles['disclosure-text']}>
      <div className={styles['form-wrapper']}>
        <LoanFormBetterTerms
          balance={balance}
          loan={loan}
          needsAllowance={needsAllowance}
          setNeedsAllowance={setNeedsAllowance}
          refresh={refresh}
        />
      </div>
    </LoanOfferBetterTermsDisclosure>
  );
}
