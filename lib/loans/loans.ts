import subgraphLoans from './subgraph/subgraphLoans';
import { parseSubgraphLoan } from './utils';

export async function loans() {
  const loans = await subgraphLoans();

  return loans.map((loan) => parseSubgraphLoan(loan));
}
