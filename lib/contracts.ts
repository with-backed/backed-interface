import { ethers, Signer } from 'ethers';
import {
  CommunityNFT__factory,
  ERC20__factory,
  ERC721,
  ERC721__factory,
  NFTLoanFacilitator__factory,
} from 'types/generated/abis';
import { SupportedNetwork } from './config';
import { COMMUNITY_NFT_CONTRACT_ADDRESS } from './constants';

type ContractDirectoryListing = {
  loanFacilitator: string;
  lendTicket: string;
  borrowTicket: string;
};

type ContractDirectory = {
  [key in SupportedNetwork]: ContractDirectoryListing;
};

const baseContracts: ContractDirectoryListing = {
  borrowTicket: '0xe01194534169DC6f38c9Aefea4917C623a99E7Ec',
  lendTicket: '0x4c6822204Ee5E13B4281942Ff231314Bf05f2D3D',
  loanFacilitator: '0x0BacCDD05a729aB8B56e09Ef19c15f953E10885f',
};

const polygonContracts: ContractDirectoryListing = {
  ...baseContracts,
  borrowTicket: '0x222FB4559B1CfbaB63fc9C9a30F14A7232CB2636',
  lendTicket: '0xe01194534169DC6f38c9Aefea4917C623a99E7Ec',
};

export const contractDirectory: ContractDirectory = {
  ethereum: baseContracts,
  optimism: baseContracts,
  rinkeby: baseContracts,
  polygon: polygonContracts,
};

export function web3LoanFacilitator(signer: Signer, network: SupportedNetwork) {
  return loanFacilitator(signer, network);
}

export function jsonRpcLoanFacilitator(
  jsonRpcProvider: string,
  network: SupportedNetwork,
) {
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcProvider);
  return loanFacilitator(provider, network);
}

export function web3Erc20Contract(address: string, signer: Signer) {
  return erc20Contract(address, signer);
}

export function web3Erc721Contract(address: string, signer: Signer) {
  return erc721Contract(address, signer);
}

export function jsonRpcERC721Contract(
  address: string,
  jsonRpcProvider: string,
): ERC721 {
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcProvider);
  return erc721Contract(address, provider);
}

export function jsonRpcERC20Contract(address: string, jsonRpcProvider: string) {
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcProvider);
  return erc20Contract(address, provider);
}

export function loanFacilitator(
  provider: ethers.providers.Provider | ethers.Signer,
  network: SupportedNetwork,
) {
  return NFTLoanFacilitator__factory.connect(
    contractDirectory[network].loanFacilitator,
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

export function web3CommunityNFT(signer: Signer) {
  return communityNFT(signer);
}

export function jsonRpcCommunityNFT(jsonRpcProvider: string) {
  const provider = new ethers.providers.JsonRpcProvider(jsonRpcProvider);
  return communityNFT(provider);
}

export function communityNFT(
  provider: ethers.providers.Provider | ethers.Signer,
) {
  return CommunityNFT__factory.connect(
    COMMUNITY_NFT_CONTRACT_ADDRESS,
    provider,
  );
}
