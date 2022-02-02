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
  }));

  return { fetching, error, nfts };
};
