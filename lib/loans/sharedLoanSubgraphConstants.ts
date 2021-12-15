export const ALL_LOAN_PROPERTIES = `
    id
    loanAssetContractAddress
    collateralContractAddress
    collateralTokenId
    perSecondInterestRate
    accumulatedInterest
    lastAccumulatedTimestamp
    durationSeconds
    loanAmount
    closed
    loanAssetDecimal
    loanAssetSymbol
    lendTicketHolder
    borrowTicketHolder
`;

export type SubgraphLoanEntity = {
  id: string;
  loanAssetContractAddress: string;
  collateralContractAddress: string;
  collateralTokenId: string;
  perSecondInterestRate: string;
  accumulatedInterest: string;
  lastAccumulatedTimestamp: string;
  durationSeconds: string;
  loanAmount: string;
  closed: boolean;
  loanAssetDecimal: number;
  loanAssetSymbol: string;
  lendTicketHolder: string;
  borrowTicketHolder: string;
};
