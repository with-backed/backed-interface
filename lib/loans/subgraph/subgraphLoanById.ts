import { nftBackedLoansClient } from 'lib/urql';
import {
  LoanByIdDocument,
  LoanByIdQuery,
} from 'types/generated/graphql/nftLoans';

export async function subgraphLoanById(id: string) {
  const { data } = await nftBackedLoansClient
    .query<LoanByIdQuery>(LoanByIdDocument, { id })
    .toPromise();

  if (data?.loan) {
    return data.loan;
  }

  // TODO: bugsnag? is this case exceptional or just something that happens?
  return null;
}
