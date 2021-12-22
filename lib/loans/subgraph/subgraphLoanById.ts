import { SubgraphLoan } from 'lib/types/SubgraphLoan';
import { nftBackedLoansClient } from 'lib/urql';
import { ALL_EVENTS, ALL_LOAN_PROPERTIES } from './subgraphSharedConstants';

function graphqlQuery(includeEvents: boolean) {
  return `
  query ($id: ID!) {
    loan(id: $id) {
      ${ALL_LOAN_PROPERTIES}
      ${includeEvents ? ALL_EVENTS : ''}
    }
  }
  `;
}

export async function subgraphLoanById(
  id: string,
  includeEvents: boolean,
): Promise<SubgraphLoan | null> {
  const {
    data: { loan },
  } = await nftBackedLoansClient
    .query(graphqlQuery(includeEvents), { id })
    .toPromise();

  return loan;
}
