import { ethers } from 'ethers';
import { useQuery } from 'urql';

const NFTsQuery = `
	query NFTs($address: String!) {
		account(id: $address) {
	  	id
	  	tokens {
				id
				identifier
				uri
				registry {
						symbol
						name
				}
				approvals {
					id
					approved {
						id
					}
				}
	  	}
	}
  }
`;

export interface NFTEntity {
  id: string;
  identifier: ethers.BigNumber;
  uri: string;
  registry: {
    symbol: string;
    name: string;
  };
  approvals: Approval[];
}

interface Approval {
  id: string;
  approved: {
    id: string;
  };
}

export const HIDDEN_NFT_ADDRESSES = [
  !!process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT
    ? process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT.toLowerCase()
    : '',
  !!process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT
    ? process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT.toLowerCase()
    : '',
];

export const useNFTs = (address: string) => {
  const [result] = useQuery({
    query: NFTsQuery,
    variables: {
      address: address.toLowerCase(),
    },
  });

  const { data, fetching, error } = result;

  const rawNfts = data?.account?.tokens || [];

  const nfts = rawNfts.map((nft: any) => ({
    ...nft,
    identifier: ethers.BigNumber.from(nft.identifier),
    isApprovedForCollateral:
      nft.approvals.filter(
        (approval: any) =>
          approval.approved.id.toLowerCase() ===
          process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT?.toLowerCase(),
      ).length > 0,
  }));

  return { fetching, error, nfts };
};

export function getNftSubraphEntityContractAddress(nft: NFTEntity): string {
  return nft.id.substring(0, 42);
}

export function constructEtherscanLinkForNft(nft: NFTEntity): string {
  const etherscanUrl = process.env.NEXT_PUBLIC_ETHERSCAN_URL;
  return `${etherscanUrl}/address/${getNftSubraphEntityContractAddress(nft)}`;
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
