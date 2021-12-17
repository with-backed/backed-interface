import { ALL_LOAN_PROPERTIES } from './subgraphSharedConstants';
import { SubgraphLoan } from 'lib/types/SubgraphLoan';
import { nftBackedLoansClient } from '../../urql';

const query = `
query ($address: Bytes!) {
  loans(or: 
        [
            { borrowTicketHolder: $address},
            { lendTicketHolder: $address }
        ], orderBy: endDateTimestamp, orderDirection: desc
        ) {
    ${ALL_LOAN_PROPERTIES}
  }
}
`;

// TODO(WILSON): explore making subgraphLoans generic enough to handle this as well
export async function getAllSubgraphLoansForAddress(
  address: string | string[],
): Promise<SubgraphLoan[]> {
  const {
    data: { loans },
  } = await nftBackedLoansClient.query(query, { address }).toPromise();

  return loans;
}
