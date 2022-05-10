import subgraphLoans from './subgraph/subgraphLoans';
import { parseSubgraphLoan } from './utils';

export async function loans(nftBackedLoansSubgraph: string) {
  const loans = await subgraphLoans(20, nftBackedLoansSubgraph);

  return loans.map((loan) => parseSubgraphLoan(loan));
}
