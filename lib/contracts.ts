import { ethers } from 'ethers';
import ERC20Artifact from '../contracts/ERC20.json';
import ERC721Artifact from '../contracts/ERC721.json';
import NFTPawnShopArtifact from '../contracts/NFTPawnShop.json';

const jsonRpcProvider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER);

export function web3PawnShopContract() {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner(0);
  return pawnShopContract(signer);
}

export function jsonRpcPawnShopContract() {
  return pawnShopContract(jsonRpcProvider);
}

export function web3Erc20Contract(address: string) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner(0);
  return erc20Contract(address, signer);
}

export function web3Erc721Contract(address: string) {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner(0);
  return erc721Contract(address, signer);
}

export function jsonRpcERC721Contract(address: string) {
  return erc721Contract(address, jsonRpcProvider);
}

export function jsonRpcERC20Contract(address: string) {
  return erc20Contract(address, jsonRpcProvider);
}

export function pawnShopContract(provider: ethers.providers.Provider | ethers.Signer) {
  return new ethers.Contract(
    process.env.NEXT_PUBLIC_NFT_PAWN_SHOP_CONTRACT,
    NFTPawnShopArtifact.abi,
    provider,
  );
}

export function erc20Contract(address: string, provider: ethers.providers.Provider | ethers.Signer) {
  return new ethers.Contract(
    address,
    ERC20Artifact.abi,
    provider,
  );
}

export function erc721Contract(address: string, provider: ethers.providers.Provider | ethers.Signer) {
  return new ethers.Contract(
    address,
    ERC721Artifact.abi,
    provider,
  );
}
