import { NFTEntity } from 'types/NFT';

export const HIDDEN_NFT_ADDRESSES = [
  !!process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT
    ? process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT.toLowerCase()
    : '',
  !!process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT
    ? process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT.toLowerCase()
    : '',
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
        process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT?.toLowerCase(),
    ).length > 0
  );
}
