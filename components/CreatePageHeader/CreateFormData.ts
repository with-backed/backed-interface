import { LoanAsset } from 'lib/loanAssets';

export type CreateFormData = {
  duration: string;
  interestRate: string;
  denomination: LoanAsset;
  loanAmount: string;
  acceptHigherLoanAmounts: boolean;
};
