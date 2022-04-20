import { MIN_RATE } from 'lib/constants';
import * as Yup from 'yup';

export const createPageFormSchema = Yup.object({
  denomination: Yup.object({
    value: Yup.string(),
    address: Yup.string(),
  }).required(),
  loanAmount: Yup.number()
    .typeError('Loan amount must be a positive integer')
    .moreThan(0, 'Loan amount must be greater than zero.')
    .required(),
  interestRate: Yup.number()
    .typeError('Interest rate must be a positive integer')
    .min(
      MIN_RATE,
      `Interest rate must be greater than the minimum value of ${MIN_RATE}%`,
    )
    .required(),
  duration: Yup.number()
    .typeError('Duration must be a positive integer')
    .moreThan(0, 'Duration must be greater than 0.')
    .required(),
  acceptHigherLoanAmounts: Yup.boolean(),
});
