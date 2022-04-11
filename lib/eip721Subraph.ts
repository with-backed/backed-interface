import { NFTEntity } from 'types/NFT';
import { contractDirectory } from './contracts';

export const HIDDEN_NFT_ADDRESSES = [
  contractDirectory.borrowTicket,
  contractDirectory.lendTicket,
];

export function getNftContractAddress(nft: NFTEntity): string {
  return nft.id.substring(0, 42);
}

export function constructEtherscanLinkForNft(nft: NFTEntity): string {
  const etherscanUrl = process.env.NEXT_PUBLIC_ETHERSCAN_URL;
  return `${etherscanUrl}/address/${getNftContractAddress(nft)}`;
}

export function isNFTApprovedForCollateral(nft: NFTEntity): boolean {
  return (
    nft.approvals.filter(
      (approval: any) =>
        approval.approved.id.toLowerCase() ===
        contractDirectory.loanFacilitator.toLowerCase(),
    ).length > 0
  );
}
