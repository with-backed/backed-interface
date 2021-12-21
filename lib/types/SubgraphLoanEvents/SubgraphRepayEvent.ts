export type SubgraphRepayEvent = {
  id: string;
  repayer: string;
  paidTo: string;
  loanAmount: string;
  interestEarned: string;
  timestamp: number;
};
