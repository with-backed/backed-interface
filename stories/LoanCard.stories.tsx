import React from 'react';
import { FiveColumn } from 'components/layouts/FiveColumn';
import { LoanCard } from 'components/LoanCard';
import { LoanCardLoaded, LoanCardLoading } from 'components/LoanCard/LoanCard';
import { GetNFTInfoResponse } from 'lib/getNFTInfo';

export default {
  title: 'components/LoanCard',
  component: LoanCard,
};

const loans = [
  {
    collateralTokenURI:
      'ipfs://QmXuEFJVjQrHX7GRWY2WnbUP59re3WsyDLZoKqXvRPSxBY/6',
    id: '18',
    loanAmount: '93000000000000000000',
    loanAssetDecimal: 18,
    loanAssetSymbol: 'DAI',
    perSecondInterestRate: '9',
    collateralTokenID: '0',
  },
  {
    collateralTokenURI: 'https://wrappedpunks.com:3000/api/punks/metadata/1003',
    id: '2',
    loanAmount: '6969000000000000000000',
    loanAssetDecimal: 18,
    loanAssetSymbol: 'DAI',
    perSecondInterestRate: '21',
    collateralTokenID: '7',
  },
];

export const LoanCards = () => (
  <FiveColumn>
    <LoanCardLoading />
    <LoanCardLoaded
      id="18"
      title="View loan #18"
      formattedLoanAmount="93.0 DAI"
      perSecondInterestRate="9"
      metadata={
        {
          name: 'Monarch #7',
          mediaMimeType: 'video/mp4',
          mediaUrl:
            'https://gateway.pinata.cloud/ipfs/QmPtmDDobXCjEACE4ftjprJn995pP2iiwHwtXwxbgX8W8z',
        } as GetNFTInfoResponse
      }
    />
  </FiveColumn>
);
