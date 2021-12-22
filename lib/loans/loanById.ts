import { ethers } from 'ethers';
import { Loan } from 'lib/types/Loan';
import { nodeLoanById } from './node/nodeLoanById';
import { subgraphLoanById } from './subgraph/subgraphLoanById';
import { loanFromSubgraphLoan } from './utils/loanFromSubgraphLoan';

export async function loanById(id: string): Promise<Loan | null> {
  const loanInfoFromGraphQL = await subgraphLoanById(id, false);

  // The Graph has indexed this loan. Fetch the interest owed and send it on its way.
  if (
    loanInfoFromGraphQL &&
    // If this is zero, events got indexed out of order and we don't have the full loan object yet.
    !ethers.BigNumber.from(
      loanInfoFromGraphQL.loanAssetContractAddress,
    ).isZero()
  ) {
    return loanFromSubgraphLoan(loanInfoFromGraphQL);
  }

  // The Graph has not indexed this loan, but it may exist.
  try {
    const loanInfo = await nodeLoanById(id);

    if (ethers.BigNumber.from(loanInfo.loanAssetContractAddress).isZero()) {
      // Solidity initializes all the loan structs,
      // so it is possible to get a return value if
      // if the loan does not exist
      return null;
    }

    return loanInfo;
  } catch (e) {
    // error, loan must not exist
    return null;
  }
}
