import React from 'react';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { ProfileLoanCard } from 'components/LoanCard';
import {
  LoanCardLoaded,
  LoanCardLoading,
  ExpandedAttributes,
  Relationship,
} from 'components/LoanCard/LoanCard';
import { GetNFTInfoResponse } from 'lib/getNFTInfo';
import { baseLoan } from 'lib/mockData';

export default {
  title: 'components/LoanCard',
  component: ProfileLoanCard,
};

export const LoanCards = () => {
  return (
    <TwelveColumn>
      <LoanCardLoading>
        <Relationship>borrower</Relationship>
        <ExpandedAttributes loan={baseLoan} />
      </LoanCardLoading>
      <LoanCardLoaded
        id={baseLoan.id.toString()}
        title="View Loan #8"
        metadata={
          {
            name: 'Monarch #7',
            mediaMimeType: 'video/mp4',
            mediaUrl:
              'https://gateway.pinata.cloud/ipfs/QmPtmDDobXCjEACE4ftjprJn995pP2iiwHwtXwxbgX8W8z',
          } as GetNFTInfoResponse
        }>
        <Relationship>borrower</Relationship>
        <ExpandedAttributes loan={baseLoan} />
      </LoanCardLoaded>
    </TwelveColumn>
  );
};
