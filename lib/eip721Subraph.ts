import { NFTEntity } from 'types/NFT';
import { contractDirectory } from 'lib/contracts';
import { SupportedNetwork } from './config';

export function hiddenNFTAddresses(network: SupportedNetwork) {
  const directory = contractDirectory[network];
  return [directory.borrowTicket, directory.lendTicket].map((a) =>
    a.toLowerCase(),
  );
}

export function getNftContractAddress(nft: NFTEntity): string {
  return nft.id.substring(0, 42);
}

export function isNFTApprovedForCollateral(
  nft: NFTEntity,
  network: SupportedNetwork,
): boolean {
  return (
    nft.approvals.filter(
      (approval: any) =>
        approval.approved.id.toLowerCase() ===
        contractDirectory[network].loanFacilitator.toLowerCase(),
    ).length > 0
  );
}
