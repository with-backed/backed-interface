import React from 'react';

import { NFTCollateralPicker } from 'components/NFTCollateralPicker/NFTCollateralPicker';
import { Provider } from 'urql';
import { clientFromUrl } from 'lib/urql';
import { noop } from 'lodash';
import { useDialogState, DialogDisclosure } from 'reakit/Dialog';
import { configs } from 'lib/config';

const NFTCollateralPickerStory = () => {
  const dialog = useDialogState({ visible: true });
  return (
    <div>
      <DialogDisclosure {...dialog}>relaunch modal</DialogDisclosure>
      <NFTCollateralPicker
        handleSetSelectedNFT={noop}
        dialog={dialog}
        connectedWallet={'0x31fd8d16641d06e0eada78b475ae367163704774'}
      />
    </div>
  );
};

export const Wrapper = () => {
  return (
    <Provider value={clientFromUrl(configs.rinkeby.eip721Subgraph)}>
      <NFTCollateralPickerStory />
    </Provider>
  );
};

export default {
  title: 'Components/NFTCollateralPicker',
  component: Wrapper,
};
