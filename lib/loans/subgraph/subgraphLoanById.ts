import { captureEvent } from '@sentry/nextjs';
import { nftBackedLoansClient } from 'lib/urql';
import {
  LoanByIdDocument,
  LoanByIdQuery,
} from 'types/generated/graphql/nftLoans';

export async function subgraphLoanById(id: string) {
  const { data, error } = await nftBackedLoansClient
    .query<LoanByIdQuery>(LoanByIdDocument, { id })
    .toPromise();

  if (error) {
    captureEvent(error);
  }

  if (data?.loan) {
    return data.loan;
  }

  return null;
}
