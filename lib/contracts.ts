import { ethers, Signer } from 'ethers';
import {
  ERC20__factory,
  ERC721,
  ERC721__factory,
  NFTLoanFacilitator__factory,
} from 'types/generated/abis';

type ContractDirectory = {
  loanFacilitator: string;
  lendTicket: string;
  borrowTicket: string;
};

const rinkebyContracts: ContractDirectory = {
  borrowTicket: '0x7953dA002eA85720517272d9b9dF83C90586A8d7',
  lendTicket: '0x5fC287807AD026ff2DedAf11d85fa8f40eEfdFD8',
  loanFacilitator: '0x0baccdd0dc70cc8de152d65def00d6fbe4c3b785',
};

// TODO: @cnasc update to dispatch between test and mainnet based on env
export const contractDirectory: ContractDirectory = rinkebyContracts;

const jsonRpcProvider = new ethers.providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER,
);

export function web3LoanFacilitator(signer: Signer) {
  return loanFacilitator(signer);
}

export function jsonRpcLoanFacilitator() {
  return loanFacilitator(jsonRpcProvider);
}

export function web3Erc20Contract(address: string, signer: Signer) {
  return erc20Contract(address, signer);
}

export function web3Erc721Contract(address: string, signer: Signer) {
  return erc721Contract(address, signer);
}

export function jsonRpcERC721Contract(address: string): ERC721 {
  return erc721Contract(address, jsonRpcProvider);
}

export function jsonRpcERC20Contract(address: string) {
  return erc20Contract(address, jsonRpcProvider);
}

export function loanFacilitator(
  provider: ethers.providers.Provider | ethers.Signer,
) {
  return NFTLoanFacilitator__factory.connect(
    contractDirectory.loanFacilitator,
    provider,
  );
}

export function erc20Contract(
  address: string,
  provider: ethers.providers.Provider | ethers.Signer,
) {
  return ERC20__factory.connect(address, provider);
}

export function erc721Contract(
  address: string,
  provider: ethers.providers.Provider | ethers.Signer,
) {
  return ERC721__factory.connect(address, provider);
}
