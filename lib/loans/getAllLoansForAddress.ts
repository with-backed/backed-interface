import { Loan } from 'lib/types/Loan';
import { SubgraphLoan } from 'lib/types/SubgraphLoan';
import { loanFromSubgraphLoan } from './utils/loanFromSubgraphLoan';

export async function getAllLoansForAddress(address: string): Promise<Loan[]> {
  const res = await fetch(`/api/addresses/${address}/loans`);
  const loans = await res.json();
  return loans.map((loan: SubgraphLoan) => loanFromSubgraphLoan(loan));
}
