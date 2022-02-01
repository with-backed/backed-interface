import subgraphLoans from './subgraph/subgraphLoans';
import { parseSubgraphLoan } from './utils';

export async function loans() {
  const loans = await subgraphLoans(20);

  return loans.map((loan) => parseSubgraphLoan(loan));
}
