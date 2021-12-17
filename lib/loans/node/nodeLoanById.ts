import { ethers } from 'ethers';
import {
  jsonRpcERC20Contract,
  jsonRpcERC721Contract,
  jsonRpcLoanFacilitator,
} from 'lib/contracts';
import { Loan } from 'lib/types/Loan';

export async function nodeLoanById(loanId: string): Promise<Loan> {
  const id = ethers.BigNumber.from(loanId);
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

  const loanAssetContract = jsonRpcERC20Contract(loanAssetContractAddress);

  const decimals = await loanAssetContract.decimals();
  const loanAssetSymbol = await loanAssetContract.symbol();
  let lender = null;
  if (!lastAccumulatedTimestamp.eq(0)) {
    lender = await lendTicket.ownerOf(loanId);
  }

  const interestOwed = await loanFacilitator.interestOwed(loanId);
  const borrower = await borrowTicket.ownerOf(loanId);
  let endDateTimestamp: number = 0;
  if (!lastAccumulatedTimestamp.eq(0)) {
    endDateTimestamp = lastAccumulatedTimestamp.add(durationSeconds).toNumber();
  }

  const collateralAssetContract = jsonRpcERC721Contract(
    collateralContractAddress,
  );
  const collateralTokenURI = await collateralAssetContract.tokenURI(id);

  return {
    id,
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
    endDateTimestamp,
    collateralTokenURI,
  };
}
