import { ALL_LOAN_PROPERTIES } from './subgraphSharedConstants';
import { nftBackedLoansClient } from '../../urql';
import { Loan } from 'types/generated/graphql/nftLoans';

const homepageQuery = `
    query {
        loans(where: { closed: false}, first: 20, orderBy: createdAtTimestamp, orderDirection: desc) {
            ${ALL_LOAN_PROPERTIES}
        }
    }
`;

// TODO(Wilson): this is a temp fix just for this query. We should generalize this method to
// take an arguments and return a cursor to return paginated results
export default async function subgraphLoans(): Promise<Loan[]> {
  const {
    data: { loans },
  } = await nftBackedLoansClient.query(homepageQuery).toPromise();

  return loans;
}
