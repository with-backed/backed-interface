import { MIN_RATE } from 'lib/constants';
import * as Yup from 'yup';

type LoanPageFormSchemaParams = {
  duration: number;
  interestRate: number;
  loanAmount: number;
};
export const loanPageFormSchema = ({
  loanAmount,
  interestRate,
  duration,
}: LoanPageFormSchemaParams) =>
  Yup.object({
    loanAmount: Yup.number()
      .min(
        loanAmount,
        `Loan amount must be at least the current term of ${loanAmount}.`,
      )
      .required(),
    interestRate: Yup.number()
      .min(MIN_RATE)
      .max(
        interestRate,
        `Interest rate must be no greater than the current term of ${interestRate}.`,
      )
      .required(),
    duration: Yup.number()
      .min(
        duration,
        `Duration must be at least the current term of ${duration} days.`,
      )
      .required(),
  });
