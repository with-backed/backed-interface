import { DescriptionList } from 'components/DescriptionList';
import { ethers } from 'ethers';
import {
  getActiveLoanCount,
  getClosedLoanCount,
  getAllInterestAmounts,
  getAllPrincipalAmounts,
} from 'lib/loans/profileHeaderMethods';
import { getInterestOwed } from 'lib/loans/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Loan } from 'types/Loan';
import { BorrowerLenderBubble } from './BorrowerLenderBubble';
import { NextLoanDueCountdown } from './NextLoanDueCountdown';
import styles from './profile.module.css';

type ProfileHeaderProps = {
  address: string;
  loans: Loan[];
};

type LoanStatsProps = {
  address: string;
  loans: Loan[];
  kind: 'borrower' | 'lender';
};
function LoanStats({ address, loans, kind }: LoanStatsProps) {
  const numActiveLoans = useMemo(() => getActiveLoanCount(loans), [loans]);
  const numClosedLoans = useMemo(() => getClosedLoanCount(loans), [loans]);
  const lentToLoans = useMemo(
    () => loans.filter((l) => !l.lastAccumulatedTimestamp.eq(0)),
    [loans],
  );

  const principalLabel = useMemo(
    () =>
      kind === 'borrower' ? 'Total Owed Principal' : 'Outstanding Principal',
    [kind],
  );
  const principalAmounts = useMemo(() => {
    return getAllPrincipalAmounts(lentToLoans).map((amount, i, arr) => (
      <div key={amount.symbol} className={styles.amount}>
        {amount.nominal} {amount.symbol}
        {i !== arr.length - 1 && ';'}
      </div>
    ));
  }, [lentToLoans]);
  const interestLabel = useMemo(
    () =>
      kind === 'borrower' ? 'Total Owed Interest' : 'Total Accrued Interest',
    [kind],
  );

  const [currentInterestAmounts, setCurrentInterestAmounts] = useState(
    getAllInterestAmounts(lentToLoans),
  );

  const refreshInterest = useCallback(() => {
    setCurrentInterestAmounts(
      getAllInterestAmounts(
        lentToLoans.map((l) => ({
          ...l,
          interestOwed: getInterestOwed(
            ethers.BigNumber.from(Date.now()).div(1000),
            l.loanAmount,
            l.lastAccumulatedTimestamp,
            l.perSecondInterestRate,
            l.accumulatedInterest,
          ),
        })),
      ),
    );
  }, [lentToLoans]);

  useEffect(() => {
    const timeOutId = setInterval(() => refreshInterest(), 1000);
    return () => clearInterval(timeOutId);
  }, [refreshInterest]);

  const interestAmounts = useMemo(() => {
    return currentInterestAmounts.map((amount, i, arr) => (
      <div key={amount.symbol} className={styles.amount}>
        {parseFloat(amount.nominal).toFixed(6)} {amount.symbol}
        {i !== arr.length - 1 && ';'}
      </div>
    ));
  }, [currentInterestAmounts]);
  return (
    <DescriptionList orientation="horizontal">
      <dt>
        <BorrowerLenderBubble
          address={address}
          borrower={kind === 'borrower'}
        />
      </dt>
      <dd>
        {numActiveLoans} Active; {numClosedLoans} Closed
      </dd>
      <dt>Next Loan Due</dt>
      <dd>
        <NextLoanDueCountdown loans={lentToLoans} />
      </dd>
      <dt>{principalLabel}</dt>
      <dd>{principalAmounts}</dd>
      <dt>{interestLabel}</dt>
      <dd>{interestAmounts}</dd>
    </DescriptionList>
  );
}

export function ProfileHeader({ address, loans }: ProfileHeaderProps) {
  const loansAsBorrower = useMemo(
    () => loans.filter((l) => l.borrower === ethers.utils.getAddress(address)),
    [loans, address],
  );
  const loansAsLender = useMemo(
    () => loans.filter((l) => l.lender === ethers.utils.getAddress(address)),
    [loans, address],
  );

  return (
    <div className={styles['profile-header-wrapper']}>
      <LoanStats address={address} loans={loansAsBorrower} kind="borrower" />
      <LoanStats address={address} loans={loansAsLender} kind="lender" />
    </div>
  );
}
