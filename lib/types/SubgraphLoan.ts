export type SubgraphLoan = {
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
  endDateTimestamp: number;
  collateralTokenURI: string;
};
