import { DescriptionList } from 'components/DescriptionList';
import { TwoColumn } from 'components/layouts/TwoColumn';
import { Media } from 'components/Media';
import { Fallback } from 'components/Media/Fallback';
import { ethers } from 'ethers';
import { useTimestamp } from 'hooks/useTimestamp';
import { humanizedDuration } from 'lib/duration';
import { formattedAnnualRate } from 'lib/interest';
import { LoanInfo } from 'lib/LoanInfoType';
import React, { useMemo } from 'react';
import styles from './LoanHeader.module.css';

type LoanHeaderProps = {
  collateralMedia: { mediaUrl: string; mediaMimeType: string } | null;
  loanInfo: LoanInfo;
};
export const LoanHeader = ({ collateralMedia, loanInfo }: LoanHeaderProps) => {
  const {
    durationSeconds,
    lastAccumulatedTimestamp,
    loanId,
    loanAmount,
    loanAssetDecimals,
    loanAssetSymbol,
    perSecondInterestRate,
  } = loanInfo;
  const timestamp = useTimestamp();
  const amount = useMemo(() => {
    return [
      ethers.utils.formatUnits(loanAmount, loanAssetDecimals),
      loanAssetSymbol,
    ].join(' ');
  }, [loanAmount, loanAssetDecimals, loanAssetSymbol]);
  const interestRate = useMemo(
    () => formattedAnnualRate(perSecondInterestRate),
    [perSecondInterestRate],
  );
  const loanStatus = useMemo(
    () => getLoanStatus(lastAccumulatedTimestamp, durationSeconds, timestamp),
    [lastAccumulatedTimestamp, durationSeconds, timestamp],
  );
  return (
    <div className={styles['loan-header']}>
      <TwoColumn>
        {collateralMedia && (
          <Media
            media={collateralMedia.mediaUrl}
            mediaMimeType={collateralMedia.mediaMimeType}
            autoPlay
          />
        )}
        {!collateralMedia && <Fallback />}
        <div>
          <DescriptionList>
            <dt>Loan #{loanId.toString()}</dt>
            <dd>{amount}</dd>
            <dt>Interest Rate</dt>
            <dd>{interestRate}%</dd>
            <dt>Status</dt>
            <dd>{loanStatus}</dd>
            <dt>Accrued</dt>
            <dd>2.477 DAI</dd>
            <dt>Duration</dt>
            <dd>{humanizedDuration(durationSeconds.toNumber())}</dd>
            <dt>Remaining</dt>
            <dd>0 days + 09:22:34</dd>
            <dt>Est. Payback</dt>
            <dd>6598.50 DAI</dd>
          </DescriptionList>
        </div>
      </TwoColumn>
    </div>
  );
};

function getLoanStatus(
  lastAccumulatedTimestamp: ethers.BigNumber,
  durationSeconds: ethers.BigNumber,
  timestamp: number | null,
) {
  if (lastAccumulatedTimestamp.eq(0)) {
    return 'Awaiting lender';
  }

  if (!timestamp) {
    return 'Loading...';
  }

  if (lastAccumulatedTimestamp.add(durationSeconds).lte(timestamp)) {
    return 'Past due';
  }

  return 'Accruing interest';
}
