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
  borrowTicket: '0xebd451381093FB24674c8269De653c911Fe981F2',
  lendTicket: '0x1eBC1B94Cc6Fc4d54Ce1510EAF3DaabC33ab90cD',
  loanFacilitator: '0x0baccdd07ad7224b73838bc0e3d3b303a111f997',
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
