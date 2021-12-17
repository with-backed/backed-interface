import { SubgraphLoan } from 'lib/types/SubgraphLoan';
import { nftBackedLoansClient } from 'lib/urql';
import { ALL_LOAN_PROPERTIES } from './subgraphSharedConstants';

const loanInfoQuery = `
query ($id: ID!) {
  loan(id: $id) {
    ${ALL_LOAN_PROPERTIES}
  }
}
`;

export async function subgraphLoanById(
  id: string,
): Promise<SubgraphLoan | null> {
  const {
    data: { loan },
  } = await nftBackedLoansClient.query(loanInfoQuery, { id }).toPromise();

  return loan;
}
