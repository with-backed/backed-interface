import { ethers } from 'ethers';
import {
  jsonRpcERC20Contract,
  jsonRpcERC721Contract,
  jsonRpcLoanFacilitator,
} from './contracts';
import { LoanInfo } from './LoanInfoType';
import { nftBackedLoansClient } from './urql';

const loanInfoQuery = `
query ($id: ID!) {
  loan(id: $id) {
    loanAssetContractAddress
    collateralContractAddress
    collateralTokenId
    perSecondInterestRate
    accumulatedInterest
    lastAccumulatedTimestamp
    durationSeconds
    loanAmount
    closed
    loanAssetDecimal
    loanAssetSymbol
    lendTicketHolder
    borrowTicketHolder
  }
}
`;

/**
 * The Graph doesn't contain `interestOwed`, so we will have to fetch that separately.
 */
async function queryLoanInfoGraphQL(
  id: string,
): Promise<Omit<LoanInfo, 'interestOwed'> | null> {
  const {
    data: { loan },
  } = await nftBackedLoansClient.query(loanInfoQuery, { id }).toPromise();

  if (!loan) {
    // The Graph hasn't indexed this loan, but it may exist.
    return null;
  }

  const {
    loanAssetContractAddress,
    collateralContractAddress,
    collateralTokenId,
    perSecondInterestRate,
    accumulatedInterest,
    lastAccumulatedTimestamp,
    durationSeconds,
    loanAmount,
    closed,
    loanAssetDecimal,
    loanAssetSymbol,
    lendTicketHolder,
    borrowTicketHolder,
  } = loan;

  return {
    loanId: ethers.BigNumber.from(id),
    loanAssetContractAddress,
    collateralContractAddress,
    collateralTokenId: ethers.BigNumber.from(collateralTokenId),
    perSecondInterestRate: ethers.BigNumber.from(perSecondInterestRate),
    accumulatedInterest: ethers.BigNumber.from(accumulatedInterest),
    lastAccumulatedTimestamp: ethers.BigNumber.from(lastAccumulatedTimestamp),
    durationSeconds: ethers.BigNumber.from(durationSeconds),
    loanAmount: ethers.BigNumber.from(loanAmount),
    closed,
    loanAssetDecimals: loanAssetDecimal,
    loanAssetSymbol,
    lender: lendTicketHolder,
    borrower: borrowTicketHolder,
  };
}

export async function getLoanInfoGraphQL(id: string): Promise<LoanInfo | null> {
  const loanInfoFromGraphQL = await queryLoanInfoGraphQL(id);

  // The Graph has indexed this loan. Fetch the interest owed and send it on its way.
  if (loanInfoFromGraphQL) {
    const loanFacilitator = jsonRpcLoanFacilitator();
    const interestOwed = await loanFacilitator.interestOwed(id);
    return { ...loanInfoFromGraphQL, interestOwed };
  }

  // The Graph has not indexed this loan, but it may exist.
  try {
    const loanInfo = await getLoanInfo(id);
    // shipit
    return loanInfo;
  } catch (e) {
    // error, loan must not exist
    return null;
  }
}

export async function getLoanInfo(id: string): Promise<LoanInfo> {
  const loanId = ethers.BigNumber.from(id);
  const loanFacilitator = jsonRpcLoanFacilitator();
  const lendTicket = jsonRpcERC721Contract(
    process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT || '',
  );
  const borrowTicket = jsonRpcERC721Contract(
    process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT || '',
  );

  const loanInfo = await loanFacilitator.loanInfo(loanId);
  const {
    loanAssetContractAddress,
    collateralContractAddress,
    collateralTokenId,
    perSecondInterestRate,
    accumulatedInterest,
    lastAccumulatedTimestamp,
    durationSeconds,
    loanAmount,
    closed,
  } = loanInfo;

  const assetContract = jsonRpcERC20Contract(loanAssetContractAddress);

  const decimals = await assetContract.decimals();
  const loanAssetSymbol = await assetContract.symbol();
  let lender = null;
  if (!lastAccumulatedTimestamp.eq(0)) {
    lender = await lendTicket.ownerOf(loanId);
    // const interest = await loanFacilitator.interestOwed(loanId);
    // const scalar = await loanFacilitator.SCALAR();
  }

  const interestOwed = await loanFacilitator.interestOwed(loanId);
  const borrower = await borrowTicket.ownerOf(loanId);

  return {
    loanId,
    loanAssetContractAddress,
    collateralContractAddress,
    collateralTokenId,
    perSecondInterestRate,
    accumulatedInterest,
    lastAccumulatedTimestamp,
    durationSeconds,
    loanAmount,
    closed,
    loanAssetDecimals: parseInt(decimals.toString()),
    loanAssetSymbol,
    lender,
    borrower,
    interestOwed,
  };
}
