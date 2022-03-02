import { nftBackedLoansClient } from 'lib/urql';
import {
  LoanByIdDocument,
  LoanByIdQuery,
} from 'types/generated/graphql/nft-backed-loans-operations';

export async function subgraphLoanById(id: string) {
  const { data } = await nftBackedLoansClient
    .query<LoanByIdQuery>(LoanByIdDocument, { id })
    .toPromise();

  if (data?.loan) {
    return data.loan;
  }
  return null;
}
