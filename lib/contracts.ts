import { ethers, Signer } from 'ethers';
import {
  ERC20__factory,
  ERC721,
  ERC721__factory,
  NFTLoanFacilitator__factory,
} from 'types/generated/abis';

const jsonRpcProvider = new ethers.providers.JsonRpcProvider(
  process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER,
);

<<<<<<< HEAD
export function web3LoanFacilitator(signer: Signer) {
=======
export function web3LoanFacilitator() {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const signer = provider.getSigner(0);
>>>>>>> c1ac414 (fix: window.ethereum types)
  return loanFacilitator(signer);
}

export function jsonRpcLoanFacilitator() {
  return loanFacilitator(jsonRpcProvider);
}

<<<<<<< HEAD
export function web3Erc20Contract(address: string, signer: Signer) {
  return erc20Contract(address, signer);
}

export function web3Erc721Contract(address: string, signer: Signer) {
=======
export function web3Erc20Contract(address: string) {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const signer = provider.getSigner(0);
  return erc20Contract(address, signer);
}

export function web3Erc721Contract(address: string) {
  const provider = new ethers.providers.Web3Provider(window.ethereum as any);
  const signer = provider.getSigner(0);
>>>>>>> c1ac414 (fix: window.ethereum types)
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
    process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT || '',
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
