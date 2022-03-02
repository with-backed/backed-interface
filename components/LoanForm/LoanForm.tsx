import { ethers } from 'ethers';
import { Loan } from 'types/Loan';
import React, { useEffect, useMemo, useState } from 'react';
import { useWeb3 } from 'hooks/useWeb3';
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
import { Button, CompletedButton } from '../Button';
import { useLoanViewerRole } from '../../hooks/useLoanViewerRole';

type LoanFormProps = {
  loan: Loan;
  refresh: () => void;
};
export function LoanForm({ loan, refresh }: LoanFormProps) {
  const { account } = useWeb3();
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
        console.log('debug:: balance', balance);
        console.log('debug:: allowanceAmount', allowanceAmount.toNumber());
        console.log(
          'debug:: needs allowance',
          allowanceAmount.lt(loan.loanAmount),
        );

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
    return <Dev>loan closed</Dev>;
    // return null;
  }

  if (!account) {
    // TODO: what about the case of "Past Due" here
    return (
      <div className={styles.wrapper}>
        <Dev>not logged in</Dev>
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
          <Dev>loan form sieze collateral</Dev>
          <LoanFormSeizeCollateral loan={loan} refresh={refresh} />
        </div>
      );
    }
    return null;
  }

  if (loan.lastAccumulatedTimestamp.eq(0) && viewerIsBorrower) {
    return (
      <div className={styles.wrapper}>
        <Dev>loan form early closure</Dev>
        <LoanFormEarlyClosure loan={loan} refresh={refresh} />
      </div>
    );
  }

  // TODO: is this the same check as loan.lender?
  if (loan.lastAccumulatedTimestamp.eq(0)) {
    return (
      <div className={styles.wrapper}>
        <Dev>loan form awaiting</Dev>
        <LoanFormAwaiting
          loan={loan}
          needsAllowance={needsAllowance}
          setNeedsAllowance={setNeedsAllowance}
          refresh={refresh}
        />
      </div>
    );
  }

  if (viewerIsBorrower) {
    return (
      <>
        <div className={styles.wrapper}>
          <Dev>loan form repay</Dev>
          <LoanFormRepay
            loan={loan}
            balance={balance}
            needsAllowance={needsAllowance}
            setNeedsAllowance={setNeedsAllowance}
            refresh={refresh}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.wrapper}>
        <Dev>offer better terms</Dev>
        <LoanFormBetterTerms
          loan={loan}
          needsAllowance={needsAllowance}
          setNeedsAllowance={setNeedsAllowance}
          refresh={refresh}
        />
      </div>
    </>
  );
}

const Dev = ({ children }: { children: any }) => {
  if (process.env.NODE_ENV === 'development') {
    return (
      <div style={{ color: 'red', position: 'absolute', left: 0, top: 0 }}>
        {children}
      </div>
    );
  } else {
    return null;
  }
};
