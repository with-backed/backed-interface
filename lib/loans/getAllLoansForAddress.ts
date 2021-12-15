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

/**
 * The Graph doesn't contain `interestOwed`, so we will have to fetch that separately.
 */
export async function getAllLoansForAddress(
  address: string | string[],
): Promise<LoanInfo[]> {
  const {
    data: { loans },
  } = await nftBackedLoansClient.query(query, { address }).toPromise();

  return loans.map((l: SubgraphLoanEntity) => parseSubgraphLoan(l));
}

// export async function getLoanInfoGraphQL(id: string): Promise<LoanInfo | null> {
//   const loanInfoFromGraphQL = await queryLoanInfoGraphQL(id);

//   // The Graph has indexed this loan. Fetch the interest owed and send it on its way.
//   if (
//     loanInfoFromGraphQL &&
//     // If this is zero, events got indexed out of order and we don't have the full loan object yet.
//     !ethers.BigNumber.from(
//       loanInfoFromGraphQL.loanAssetContractAddress,
//     ).isZero()
//   ) {
//     const loanFacilitator = jsonRpcLoanFacilitator();
//     const interestOwed = await loanFacilitator.interestOwed(id);
//     return { ...loanInfoFromGraphQL, interestOwed };
//   }

//   // The Graph has not indexed this loan, but it may exist.
//   try {
//     const loanInfo = await getLoanInfo(id);
//     // shipit
//     return loanInfo;
//   } catch (e) {
//     // error, loan must not exist
//     return null;
//   }
// }

// export async function getLoanInfo(id: string): Promise<LoanInfo> {
//   const loanId = ethers.BigNumber.from(id);
//   const loanFacilitator = jsonRpcLoanFacilitator();
//   const lendTicket = jsonRpcERC721Contract(
//     process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT || '',
//   );
//   const borrowTicket = jsonRpcERC721Contract(
//     process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT || '',
//   );

//   const loanInfo = await loanFacilitator.loanInfo(loanId);
//   const {
//     loanAssetContractAddress,
//     collateralContractAddress,
//     collateralTokenId,
//     perSecondInterestRate,
//     accumulatedInterest,
//     lastAccumulatedTimestamp,
//     durationSeconds,
//     loanAmount,
//     closed,
//   } = loanInfo;

//   const assetContract = jsonRpcERC20Contract(loanAssetContractAddress);

//   const decimals = await assetContract.decimals();
//   const loanAssetSymbol = await assetContract.symbol();
//   let lender = null;
//   if (!lastAccumulatedTimestamp.eq(0)) {
//     lender = await lendTicket.ownerOf(loanId);
//     // const interest = await loanFacilitator.interestOwed(loanId);
//     // const scalar = await loanFacilitator.SCALAR();
//   }

//   const interestOwed = await loanFacilitator.interestOwed(loanId);
//   const borrower = await borrowTicket.ownerOf(loanId);

//   return {
//     loanId,
//     loanAssetContractAddress,
//     collateralContractAddress,
//     collateralTokenId,
//     perSecondInterestRate,
//     accumulatedInterest,
//     lastAccumulatedTimestamp,
//     durationSeconds,
//     loanAmount,
//     closed,
//     loanAssetDecimals: parseInt(decimals.toString()),
//     loanAssetSymbol,
//     lender,
//     borrower,
//     interestOwed,
//   };
// }
