import Bugsnag from '@bugsnag/js';
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
    Bugsnag.notify(error);
  }

  if (data?.loan) {
    return data.loan;
  }

  // TODO: is not finding a loan exceptional or just something that happens?
  Bugsnag.notify(
    new Error(`Loan with id ${id} does not exist in the subgraph`),
  );
  return null;
}
