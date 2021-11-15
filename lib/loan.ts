import { ethers } from 'ethers';
import {
  jsonRpcERC20Contract,
  jsonRpcERC721Contract,
  jsonRpcLoanFacilitator,
} from './contracts';
import { LoanInfo } from './LoanInfoType';

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
  const { loanAssetContractAddress } = loanInfo;
  const { collateralContractAddress } = loanInfo;
  const { collateralTokenId } = loanInfo;
  const { perSecondInterestRate } = loanInfo;
  const { accumulatedInterest } = loanInfo;
  const { lastAccumulatedTimestamp } = loanInfo;
  const { durationSeconds } = loanInfo;
  const { loanAmount } = loanInfo;
  const { closed } = loanInfo;

  const assetContract = jsonRpcERC20Contract(loanAssetContractAddress);

  const decimals = await assetContract.decimals();
  const loanAssetSymbol = await assetContract.symbol();
  let loanOwner = null;
  if (!lastAccumulatedTimestamp.eq(0)) {
    loanOwner = await lendTicket.ownerOf(loanId);
    // const interest = await loanFacilitator.interestOwed(loanId);
    // const scalar = await loanFacilitator.SCALAR();
  }

  const interestOwed = await loanFacilitator.interestOwed(loanId);
  const ticketOwner = await borrowTicket.ownerOf(loanId);

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
    loanOwner,
    ticketOwner,
    interestOwed,
  };
}
