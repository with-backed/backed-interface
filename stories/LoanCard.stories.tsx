import React from 'react';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { LoanCard } from 'components/LoanCard';
import { LoanCardLoaded, LoanCardLoading } from 'components/LoanCard/LoanCard';
import {
  ProfileLoanCardLoaded,
  ProfileLoanCardLoading,
  ExpandedAttributes,
} from 'components/LoanCard/ProfileLoanCard';
import { GetNFTInfoResponse } from 'lib/getNFTInfo';
import { ethers } from 'ethers';
import { baseLoan } from 'lib/mockData';

export default {
  title: 'components/LoanCard',
  component: LoanCard,
};

const perSecondInterestRate = ethers.BigNumber.from('9');

export const LoanCards = () => (
  <TwelveColumn>
    <LoanCardLoading />
    <LoanCardLoaded
      id="18"
      title="View loan #18"
      formattedLoanAmount="93.0 DAI"
      perSecondInterestRate={perSecondInterestRate}
      metadata={
        {
          name: 'Monarch #7',
          mediaMimeType: 'video/mp4',
          mediaUrl:
            'https://gateway.pinata.cloud/ipfs/QmPtmDDobXCjEACE4ftjprJn995pP2iiwHwtXwxbgX8W8z',
        } as GetNFTInfoResponse
      }
    />
    <LoanCardLoaded
      id="18"
      title="View loan #18"
      formattedLoanAmount="930000000000.0 SHIB"
      perSecondInterestRate={perSecondInterestRate}
      metadata={
        {
          name: 'Monarch #7',
          mediaMimeType: 'video/mp4',
          mediaUrl:
            'https://gateway.pinata.cloud/ipfs/QmPtmDDobXCjEACE4ftjprJn995pP2iiwHwtXwxbgX8W8z',
        } as GetNFTInfoResponse
      }
    />
  </TwelveColumn>
);

export const ProfileLoanCards = () => {
  return (
    <TwelveColumn>
      <ProfileLoanCardLoading relationship="borrower">
        <ExpandedAttributes loan={baseLoan} />
      </ProfileLoanCardLoading>
      <ProfileLoanCardLoaded
        id={baseLoan.id.toString()}
        relationship="lender"
        title="View Loan #8"
        metadata={
          {
            name: 'Monarch #7',
            mediaMimeType: 'video/mp4',
            mediaUrl:
              'https://gateway.pinata.cloud/ipfs/QmPtmDDobXCjEACE4ftjprJn995pP2iiwHwtXwxbgX8W8z',
          } as GetNFTInfoResponse
        }>
        <ExpandedAttributes loan={baseLoan} />
      </ProfileLoanCardLoaded>
    </TwelveColumn>
  );
};
