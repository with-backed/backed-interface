import React, { useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { CreateTicketForm } from 'components/createPage/CreateTicketForm';
import { Fieldset } from 'components/Fieldset';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { ConnectWallet } from 'components/ConnectWallet';
import { NFTCollateralPicker } from 'components/createPage/NFTCollateralPicker/NFTCollateralPicker';
import { Provider } from 'urql';
import { eip721Client } from 'lib/urql';
import { AuthorizedNFT } from 'components/createPage/AuthorizedNFT';
import {
  NFTEntity,
  getNftContractAddress,
  HIDDEN_NFT_ADDRESSES,
  isNFTApprovedForCollateral,
} from 'lib/eip721Subraph';
import styles from './create.module.css';
import { useDialogState } from 'reakit/Dialog';
import { DialogDisclosureButton } from 'components/Button';
import { FormWrapper } from 'components/layouts/FormWrapper';
import { useWeb3 } from 'hooks/useWeb3';
import { PageWrapper } from 'components/layouts/PageWrapper';
import { CreatePageHeader } from 'components/CreatePageHeader';

export default function Create() {
  const { account } = useWeb3();
  const [selectedNFT, setSelectedNFT] = useState<NFTEntity>();
  const [isCollateralApproved, setIsCollateralApproved] = useState(false);
  const dialog = useDialogState();

  const [collateralAddress, collateralTokenID] = useMemo(() => {
    if (!selectedNFT) return ['', ethers.BigNumber.from(-1)];
    return [getNftContractAddress(selectedNFT), selectedNFT?.identifier];
  }, [selectedNFT]);

  return <CreatePageHeader />;
}
