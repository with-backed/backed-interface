import { ethers } from 'ethers';
import { NFTEntity } from 'types/NFT';
import { useQuery } from 'urql';

type RawNFT = Omit<NFTEntity, 'id'> & { id: string };

type Data =
  | {
      account: {
        id: string;
        tokens: RawNFT[];
      };
    }
  | undefined
  | null;

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

export const useNFTs = (address: string) => {
  const [result] = useQuery<Data>({
    query: NFTsQuery,
    variables: {
      address: address.toLowerCase(),
    },
  });

  const { data, fetching, error } = result;

  const rawNfts = data?.account?.tokens || [];

  const nfts: NFTEntity[] = rawNfts.map((nft) => ({
    ...nft,
    identifier: ethers.BigNumber.from(nft.identifier),
  }));

  return { fetching, error, nfts };
};
