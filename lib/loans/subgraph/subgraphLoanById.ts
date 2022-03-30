import { nftBackedLoansClient } from 'lib/urql';
import {
  LoanByIdDocument,
  LoanByIdQuery,
} from 'types/generated/graphql/nftLoans';

export async function subgraphLoanById(id: string) {
  const { data, error, stale } = await nftBackedLoansClient
    .query<LoanByIdQuery>(LoanByIdDocument, { id })
    .toPromise();

  console.log(JSON.stringify({ data, error, stale }));

  if (error) {
    // TODO: bugsnag
  }

  if (data?.loan) {
    return data.loan;
  }

  // TODO: bugsnag? is not finding a loan exceptional or just something that happens?
  return null;
}
