import * as Yup from 'yup';

type CreatePageFormSchemaParams = {
  duration: number;
  interestRate: number;
  loanAmount: number;
};
export const createPageFormSchema = ({
  loanAmount,
  interestRate,
  duration,
}: CreatePageFormSchemaParams) =>
  Yup.object({
    loanAmount: Yup.number()
      .min(
        loanAmount,
        `Loan amount must be at least the current term of ${loanAmount}.`,
      )
      .required(),
    interestRate: Yup.number()
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
