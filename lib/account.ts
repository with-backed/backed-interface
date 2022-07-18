import { ethers } from 'ethers';
import { contractDirectory, jsonRpcERC20Contract } from 'lib/contracts';
import { SupportedNetwork } from './config';

export async function getAccountLoanAssetAllowance(
  account: string,
  loanAssetContractAddress: string,
  jsonRpcProvider: string,
  network: SupportedNetwork,
) {
  const assetContract = jsonRpcERC20Contract(
    loanAssetContractAddress,
    jsonRpcProvider,
    network,
  );
  return assetContract.allowance(
    account as string,
    contractDirectory[network].loanFacilitator,
  );
}

export function waitForApproval(
  account: string,
  contractAddress: string,
  jsonRpcProvider: string,
  network: SupportedNetwork,
) {
  const contract = jsonRpcERC20Contract(
    contractAddress,
    jsonRpcProvider,
    network,
  );
  const filter = contract.filters.Approval(
    account,
    contractDirectory[network].loanFacilitator,
    null,
  );
  return new Promise((resolve) => {
    contract.once(filter, () => {
      resolve(true);
    });
  });
}

export function resolveEns(address: string, jsonRpcProvider: string) {
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcProvider);

  return provider.resolveName(address);
}

export function addressToENS(address: string, jsonRpcProvider: string) {
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcProvider);

  return provider.lookupAddress(address);
}
