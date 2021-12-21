export type SubgraphLendEvent = {
  id: string;
  timestamp: number;
  lender: string;
  loanAmount: string;
  perSecondInterestRate: string;
  durationSeconds: string;
};
