import { LoanInfo } from 'lib/LoanInfoType';
import { SubgraphLoanEntity } from './sharedLoanSubgraphConstants';
import { parseSubgraphLoan } from './utils';

export async function getAllLoansForAddress(
  address: string,
): Promise<LoanInfo[]> {
  const res = await fetch(`/api/addresses/${address}/loans`);
  const loans = await res.json();
  return loans.map((loan: SubgraphLoanEntity) => parseSubgraphLoan(loan));
}
