import React, { useContext } from 'react';

import { NFTCollateralPicker } from 'components/createPage/NFTCollateralPicker/NFTCollateralPicker';
import { Provider, useQuery } from 'urql';
import { eip721Client } from 'lib/urql';
import { ethers } from 'ethers';
import { noop } from 'lodash';

const NFTCollateralPickerStory = () => {
  return (
    <NFTCollateralPicker
      handleSetSelectedNFT={noop}
      hidePicker={noop}
      connectedWallet={'0x31fd8d16641d06e0eada78b475ae367163704774'}
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
