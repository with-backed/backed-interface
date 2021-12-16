import { DescriptionList } from 'components/DescriptionList';
import { TwoColumn } from 'components/layouts/TwoColumn';
import { Fallback } from 'components/Media/Fallback';
import { NFTMedia } from 'components/Media/NFTMedia';
import { ethers } from 'ethers';
import React from 'react';
import styles from './LoanHeader.module.css';

type LoanHeaderProps = {
  collateralAddress: string;
  collateralTokenId: ethers.BigNumber;
};
export const LoanHeader = ({
  collateralAddress,
  collateralTokenId,
}: LoanHeaderProps) => {
  return (
    <TwoColumn>
      <NFTMedia
        collateralAddress={collateralAddress}
        collateralTokenID={collateralTokenId}
      />
      <DescriptionList>
        <dt>Loan #1451</dt>
        <dd>6400 DAI</dd>
        <dt>Interest Rate</dt>
        <dd>3.875%</dd>
        <dt>Status</dt>
        <dd>Accruing interest</dd>
        <dt>Accrued</dt>
        <dd>2.477 DAI</dd>
        <dt>Duration</dt>
        <dd>400 days</dd>
        <dt>Remaining</dt>
        <dd>0 days + 09:22:34</dd>
        <dt>Est. Payback</dt>
        <dd>6598.50 DAI</dd>
      </DescriptionList>
    </TwoColumn>
  );
};

export const LoanHeaderLoading = () => {
  return (
    <TwoColumn>
      <Fallback />
    </TwoColumn>
  );
};
