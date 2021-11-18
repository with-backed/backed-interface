import React, { useContext } from 'react';

import { NFTCollateralPicker } from 'components/createPage/NFTCollateralPicker/NFTCollateralPicker';
import { Provider, useQuery } from 'urql';
import { eip721Client } from 'lib/urql';

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

  const nfts = data?.account?.tokens || [];

  return { fetching, error, nfts };
};

const HIDDEN_NFT_ADDRESSES = [
  !!process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT
    ? process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT.toLowerCase()
    : '',
  !!process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT
    ? process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT.toLowerCase()
    : '',
];

const NFTCollateralPickerStory = () => {
  return (
    <NFTCollateralPicker
      connectedWallet={'0x31fd8d16641d06e0eada78b475ae367163704774'}
      hiddenNFTAddresses={HIDDEN_NFT_ADDRESSES}
    />
  );
};

export const Wrapper = () => {
  return (
    <Provider value={eip721Client}>
      <NFTCollateralPickerStory />
    </Provider>
  );
};

export default {
  title: 'createPage/NFTCollateralPicker',
  component: Wrapper,
};
