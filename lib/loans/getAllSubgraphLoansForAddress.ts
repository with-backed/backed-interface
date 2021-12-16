import {
  ALL_LOAN_PROPERTIES,
  SubgraphLoanEntity,
} from './sharedLoanSubgraphConstants';
import { nftBackedLoansClient } from '../urql';

const query = `
query ($address: Bytes!) {
  loans(or: 
        [
            { borrowTicketHolder: $address},
            { lendTicketHolder: $address}
        ], orderBy: endDateTimestamp, orderDirection: desc
        ) {
    ${ALL_LOAN_PROPERTIES}
  }
}
`;

export async function getAllSubgraphLoansForAddress(
  address: string | string[],
): Promise<SubgraphLoanEntity[]> {
  const {
    data: { loans },
  } = await nftBackedLoansClient.query(query, { address }).toPromise();

  return loans;
}
