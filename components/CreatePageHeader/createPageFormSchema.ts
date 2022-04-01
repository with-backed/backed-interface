import { MIN_RATE } from 'lib/constants';
import * as Yup from 'yup';

export const createPageFormSchema = Yup.object({
  denomination: Yup.object({
    value: Yup.string(),
    address: Yup.string(),
  }).required(),
  loanAmount: Yup.number()
    .moreThan(0, 'Loan amount must be greater than zero.')
    .required(),
  interestRate: Yup.number()
    .min(
      MIN_RATE,
      `Interest rate must be greater than the minimum value of ${MIN_RATE}%`,
    )
    .required(),
  duration: Yup.number()
    .moreThan(0, 'Duration must be longer than 0 days.')
    .required(),
});
