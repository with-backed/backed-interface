import { DescriptionList } from 'components/DescriptionList';
import { LoanForm } from 'components/LoanForm';
import { Media } from 'components/Media';
import { Fallback } from 'components/Media/Fallback';
import { useLoanDetails } from 'hooks/useLoanDetails';
import { CollateralMedia } from 'types/CollateralMedia';
import { Loan } from 'types/Loan';
import React, { useMemo } from 'react';
import styles from './LoanHeader.module.css';
import { TwelveColumn } from 'components/layouts/TwelveColumn';

type LoanHeaderProps = {
  loan: Loan;
  collateralMedia: CollateralMedia | null;
  refresh: () => void;
};

const listComponentLookup: {
  [key: string]: (props: ListProps) => JSX.Element;
} = {
  Closed: LoanHeaderClosedList,
  'No lender': LoanHeaderAwaitingList,
  'Loading...': LoanHeaderLoadingList,
  'Past due': LoanHeaderPastDueList,
  'Accruing interest': LoanHeaderAccruingList,
};

export function LoanHeader({
  collateralMedia,
  loan,
  refresh,
}: LoanHeaderProps) {
  const details = useLoanDetails(loan);
  const List = useMemo(
    () => listComponentLookup[details.formattedStatus],
    [details.formattedStatus],
  );

  return (
    <div className={styles['loan-header']}>
      <TwelveColumn>
        <div className={styles.media}>
          {collateralMedia && (
            <Media
              media={collateralMedia.mediaUrl}
              mediaMimeType={collateralMedia.mediaMimeType}
              autoPlay={true}
            />
          )}
          {!collateralMedia && <Fallback />}
        </div>
        <div className={styles.form}>
          <List details={details} />
          <LoanForm loan={loan} refresh={refresh} />
        </div>
      </TwelveColumn>
    </div>
  );
}

type ListProps = {
  details: ReturnType<typeof useLoanDetails>;
};

function LoanHeaderLoadingList({
  details: {
    formattedStatus,
    formattedTotalDuration,
    longFormattedInterestRate,
    formattedLoanID,
    longFormattedPrincipal,
  },
}: ListProps) {
  return (
    <DescriptionList orientation="horizontal" clamped>
      <dt>Loan ID</dt>
      <dd>{formattedLoanID}</dd>
      <dt>Loan Amount</dt>
      <dd>{longFormattedPrincipal}</dd>
      <dt>Interest Rate</dt>
      <dd>{longFormattedInterestRate}</dd>
      <dt>Duration</dt>
      <dd>{formattedTotalDuration}</dd>
      <dt>Status</dt>
      <dd>{formattedStatus}</dd>
    </DescriptionList>
  );
}

function LoanHeaderAwaitingList({
  details: {
    formattedStatus,
    longFormattedInterestRate,
    formattedLoanID,
    longFormattedPrincipal,
    formattedTotalDuration,
  },
}: ListProps) {
  return (
    <DescriptionList orientation="horizontal" clamped>
      <dt>Loan ID</dt>
      <dd>{formattedLoanID}</dd>
      <dt>Loan Amount</dt>
      <dd>{longFormattedPrincipal}</dd>
      <dt>Interest Rate</dt>
      <dd>{longFormattedInterestRate}</dd>
      <dt>Duration</dt>
      <dd>{formattedTotalDuration}</dd>
      <dt>Status</dt>
      <dd>{formattedStatus}</dd>
    </DescriptionList>
  );
}

function LoanHeaderClosedList({
  details: {
    formattedStatus,
    formattedTotalDuration,
    longFormattedInterestRate,
    formattedLoanID,
    longFormattedPrincipal,
    longFormattedInterestAccrued,
    longFormattedTotalPayback,
  },
}: ListProps) {
  return (
    <DescriptionList orientation="horizontal" clamped>
      <dt>Loan ID</dt>
      <dd>{formattedLoanID}</dd>
      <dt>Loan Amount</dt>
      <dd>{longFormattedPrincipal}</dd>
      <dt>Interest Rate</dt>
      <dd>{longFormattedInterestRate}</dd>
      <dt>Status</dt>
      <dd className={styles.red}>{formattedStatus}</dd>
      <dt>Accrued</dt>
      <dd>{longFormattedInterestAccrued}</dd>
      <dt>Duration</dt>
      <dd>{formattedTotalDuration}</dd>
      <dt>Remaining</dt>
      <dd>0 days</dd>
      <dt>Total Payback</dt>
      <dd>{longFormattedTotalPayback}</dd>
    </DescriptionList>
  );
}

function LoanHeaderAccruingList({
  details: {
    formattedStatus,
    formattedTotalDuration,
    longFormattedInterestRate,
    formattedLoanID,
    longFormattedPrincipal,
    longFormattedInterestAccrued,
    longFormattedEstimatedPaybackAtMaturity,
    formattedTimeRemaining,
  },
}: ListProps) {
  return (
    <DescriptionList orientation="horizontal" clamped>
      <dt>Loan ID</dt>
      <dd>{formattedLoanID}</dd>
      <dt>Loan Amount</dt>
      <dd>{longFormattedPrincipal}</dd>
      <dt>Interest Rate</dt>
      <dd>{longFormattedInterestRate}</dd>
      <dt>Status</dt>
      <dd>{formattedStatus}</dd>
      <dt>Accrued</dt>
      <dd>{longFormattedInterestAccrued}</dd>
      <dt>Duration</dt>
      <dd>{formattedTotalDuration}</dd>
      <dt>Remaining</dt>
      <dd>{formattedTimeRemaining}</dd>
      <dt>Est. Payback</dt>
      <dd>{longFormattedEstimatedPaybackAtMaturity}</dd>
    </DescriptionList>
  );
}

function LoanHeaderPastDueList({
  details: {
    formattedStatus,
    formattedTotalDuration,
    longFormattedInterestRate,
    formattedLoanID,
    longFormattedPrincipal,
    longFormattedInterestAccrued,
    longFormattedEstimatedPaybackAtMaturity,
  },
}: ListProps) {
  return (
    <DescriptionList orientation="horizontal" clamped>
      <dt>Loan ID</dt>
      <dd>{formattedLoanID}</dd>
      <dt>Loan Amount</dt>
      <dd>{longFormattedPrincipal}</dd>
      <dt>Interest Rate</dt>
      <dd>{longFormattedInterestRate}</dd>
      <dt>Status</dt>
      <dd className={styles.red}>{formattedStatus}</dd>
      <dt>Accrued</dt>
      <dd>{longFormattedInterestAccrued}</dd>
      <dt>Duration</dt>
      <dd>{formattedTotalDuration}</dd>
      <dt>Remaining</dt>
      <dd>0 days</dd>
      <dt>Est. Payback</dt>
      <dd>{longFormattedEstimatedPaybackAtMaturity}</dd>
    </DescriptionList>
  );
}
