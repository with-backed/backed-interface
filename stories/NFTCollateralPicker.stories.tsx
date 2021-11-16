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

const useNFTs = () => {
  const [result] = useQuery({
    query: NFTsQuery,
    variables: {
      address: '0x31fd8d16641d06e0eada78b475ae367163704774'.toLowerCase(),
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
  const { fetching, error, nfts } = useNFTs();

  if (fetching) {
    return <div>fetching</div>;
  }

  if (error) {
    return <div>error</div>;
  }

  return (
    <NFTCollateralPicker
      nfts={nfts}
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
