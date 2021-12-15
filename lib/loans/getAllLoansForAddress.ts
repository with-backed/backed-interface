import { ethers } from 'ethers';
import {
  ALL_LOAN_PROPERTIES,
  SubgraphLoanEntity,
} from './sharedLoanSubgraphConstants';
import { LoanInfo } from '../LoanInfoType';
import { nftBackedLoansClient } from '../urql';
import { parseSubgraphLoan } from './utils';

const query = `
query ($address: Bytes!) {
  loans(or: [
      { borrowTicketHolder: $address},
      { lendTicketHolder: $address}
  ]) {
    ${ALL_LOAN_PROPERTIES}
  }
}
`;

export async function getAllLoansForAddress(
  address: string | string[],
): Promise<LoanInfo[]> {
  const {
    data: { loans },
  } = await nftBackedLoansClient.query(query, { address }).toPromise();

  return loans.map((l: SubgraphLoanEntity) => parseSubgraphLoan(l));
}
