import React, { useContext } from 'react';

import {
  NFTCollateralPicker,
  NFTEntity,
} from 'components/createPage/NFTCollateralPicker/NFTCollateralPicker';
import { Provider, useQuery } from 'urql';
import { eip721Client } from 'lib/urql';
import { ethers } from 'ethers';

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
