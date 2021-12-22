import subgraphLoans from './subgraph/subgraphLoans';
import { loanFromSubgraphLoan } from './utils/loanFromSubgraphLoan';

export async function loans() {
  const loans = await subgraphLoans();

  return loans.map((loan) => loanFromSubgraphLoan(loan));
}
