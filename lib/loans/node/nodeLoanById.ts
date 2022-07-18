import { ethers } from 'ethers';
import { SupportedNetwork } from 'lib/config';
import {
  contractDirectory,
  jsonRpcERC20Contract,
  jsonRpcERC721Contract,
  jsonRpcLoanFacilitator,
} from 'lib/contracts';
import { Loan } from 'types/Loan';

export async function nodeLoanById(
  loanId: string,
  jsonRpcProvider: string,
  network: SupportedNetwork,
): Promise<Loan> {
  const id = ethers.BigNumber.from(loanId);
  const loanFacilitator = jsonRpcLoanFacilitator(jsonRpcProvider, network);
  const lendTicket = jsonRpcERC721Contract(
    contractDirectory[network].lendTicket,
    jsonRpcProvider,
    network,
  );
  const borrowTicket = jsonRpcERC721Contract(
    contractDirectory[network].borrowTicket,
    jsonRpcProvider,
    network,
  );

  const loanInfo = await loanFacilitator.loanInfo(loanId);
  const {
    loanAssetContractAddress,
    collateralContractAddress,
    collateralTokenId,
    perAnnumInterestRate,
    accumulatedInterest,
    lastAccumulatedTimestamp,
    durationSeconds,
    loanAmount,
    closed,
    allowLoanAmountIncrease,
  } = loanInfo;

  const loanAssetContract = jsonRpcERC20Contract(
    loanAssetContractAddress,
    jsonRpcProvider,
    network,
  );

  const decimals = await loanAssetContract.decimals();
  const loanAssetSymbol = await loanAssetContract.symbol();
  let lender = null;
  if (lastAccumulatedTimestamp != 0) {
    lender = await lendTicket.ownerOf(loanId);
  }

  const interestOwed = await loanFacilitator.interestOwed(loanId);
  const borrower = await borrowTicket.ownerOf(loanId);
  let endDateTimestamp: number = 0;
  if (lastAccumulatedTimestamp != 0) {
    endDateTimestamp = lastAccumulatedTimestamp + durationSeconds;
  }

  const collateralAssetContract = jsonRpcERC721Contract(
    collateralContractAddress,
    jsonRpcProvider,
    network,
  );
  const collateralTokenURI = await collateralAssetContract.tokenURI(
    collateralTokenId,
  );
  const collateralName = await collateralAssetContract.name();

  return {
    id,
    loanAssetContractAddress: ethers.utils.getAddress(loanAssetContractAddress),
    collateralName,
    collateralContractAddress: ethers.utils.getAddress(
      collateralContractAddress,
    ),
    collateralTokenId,
    perAnumInterestRate: ethers.BigNumber.from(perAnnumInterestRate),
    accumulatedInterest,
    lastAccumulatedTimestamp: ethers.BigNumber.from(lastAccumulatedTimestamp),
    durationSeconds: ethers.BigNumber.from(durationSeconds),
    loanAmount,
    closed,
    loanAssetDecimals: parseInt(decimals.toString()),
    loanAssetSymbol,
    lender: lender ? ethers.utils.getAddress(lender) : null,
    borrower: ethers.utils.getAddress(borrower),
    interestOwed,
    endDateTimestamp,
    collateralTokenURI,
    allowLoanAmountIncrease,
  };
}
