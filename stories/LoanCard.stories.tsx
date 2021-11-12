import React from 'react';
import { FiveColumn } from 'components/layouts/FiveColumn';
import { LoanCard } from 'components/LoanCard';

export default {
  title: 'components/LoanCard',
  component: LoanCard,
};

const loans = [
  {
    id: '10',
    loanAmount: '100000000000000000000',
    loanAssetDecimal: 18,
    loanAssetSymbol: 'DAI',
    perSecondInterestRate: '3',
    collateralTokenURI:
      'https://ipfs.io/ipfs/Qmdt4a3YkTcgZCC1UJaqzLFKNYinzB3AE69uSrug9Jke8L',
  },
  {
    id: '11',
    loanAmount: '5000000000000000000',
    loanAssetDecimal: 18,
    loanAssetSymbol: 'DAI',
    perSecondInterestRate: '63',
    collateralTokenURI: 'ipfs://Qme2GWz7Qm7V1UjYxtkxy22uA59WZEMLEtZMLFHtc4Gzop',
  },
];

export const LoanCards = () => (
  <FiveColumn>
    {loans.map((l) => (
      <LoanCard key={l.id} loan={l} />
    ))}
  </FiveColumn>
);
