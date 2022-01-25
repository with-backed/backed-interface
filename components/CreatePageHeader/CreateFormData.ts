import { LoanAsset } from 'lib/loanAssets';

export type CreateFormData = {
  duration: string;
  interestRate: string;
  loanAsset: LoanAsset;
  loanAmount: string;
};
