import Bugsnag from '@bugsnag/js';
import { ethers } from 'ethers';
import { useEffect } from 'react';
import {
  NftsQuery,
  NftsDocument,
} from 'types/generated/graphql/eip721subgraph';
import { NFTEntity } from 'types/NFT';
import { useQuery } from 'urql';

export const useNFTs = (address: string) => {
  const [result] = useQuery<NftsQuery>({
    query: NftsDocument,
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

  useEffect(() => {
    if (error) {
      Bugsnag.notify(error);
    }
  }, [error]);

  return { fetching, error, nfts };
};
