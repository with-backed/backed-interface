import { DescriptionList } from 'components/DescriptionList';
import {
  getActiveLoanCount,
  getClosedLoanCount,
  getAllInterestAmounts,
  getAllPrincipalAmounts,
} from 'lib/loans/profileHeaderMethods';
import { useMemo } from 'react';
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
  const principalLabel = useMemo(
    () =>
      kind === 'borrower' ? 'Total Owed Principal' : 'Outstanding Principal',
    [kind],
  );
  const principalAmounts = useMemo(() => {
    return getAllPrincipalAmounts(loans).map((amount, i, arr) => (
      <div key={amount.symbol} className={styles.amount}>
        {amount.nominal} {amount.symbol}
        {i !== arr.length - 1 && ';'}
      </div>
    ));
  }, [loans]);
  const interestLabel = useMemo(
    () =>
      kind === 'borrower' ? 'Total Owed Interest' : 'Total Accrued Interest',
    [kind],
  );
  const interestAmounts = useMemo(() => {
    return getAllInterestAmounts(loans).map((amount, i, arr) => (
      <div key={amount.symbol} className={styles.amount}>
        {amount.nominal} {amount.symbol}
        {i !== arr.length - 1 && ';'}
      </div>
    ));
  }, [loans]);
  return (
    <DescriptionList orientation="horizontal">
      <dt>
        <BorrowerLenderBubble
          address={address || ''}
          borrower={kind === 'borrower'}
        />
      </dt>
      <dd>
        {numActiveLoans} Active; {numClosedLoans} Closed
      </dd>
      <dt>Next Loan Due</dt>
      <dd>
        <NextLoanDueCountdown loans={loans} />
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
    () =>
      loans.filter((l) => l.borrower.toLowerCase() === address.toLowerCase()),
    [loans, address],
  );
  const loansAsLender = useMemo(
    () =>
      loans.filter((l) => l.lender?.toLowerCase() === address.toLowerCase()),
    [loans, address],
  );

  return (
    <div className={styles['profile-header-wrapper']}>
      <LoanStats address={address} loans={loansAsBorrower} kind="borrower" />
      <LoanStats address={address} loans={loansAsLender} kind="lender" />
    </div>
  );
}
