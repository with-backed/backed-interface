import {
  Button,
  CompletedButton,
  DialogDisclosureButton,
  TransactionButton,
} from 'components/Button';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { ethers } from 'ethers';
import { useWeb3 } from 'hooks/useWeb3';
import {
  getNftContractAddress,
  HIDDEN_NFT_ADDRESSES,
  isNFTApprovedForCollateral,
  NFTEntity,
} from 'lib/eip721Subraph';
import React, { useCallback, useMemo, useState } from 'react';
import { useDialogState, DialogStateReturn } from 'reakit/Dialog';
import styles from './CreatePageHeader.module.css';
import { Provider } from 'urql';
import { eip721Client } from 'lib/urql';
import { NFTCollateralPicker } from 'components/createPage/NFTCollateralPicker/NFTCollateralPicker';
import { NFTMedia } from 'components/Media/NFTMedia';
import { jsonRpcERC721Contract, web3Erc721Contract } from 'lib/contracts';
import { State } from './State';
import { explainers } from './explainers';
import { CreatePageForm } from './CreatePageForm';

export function CreatePageHeader() {
  const { account } = useWeb3();
  const dialog = useDialogState();

  const [selectedNFT, setSelectedNFT] = useState<NFTEntity | null>(null);
  const [collateralAddress, collateralTokenID] = useMemo(() => {
    if (!selectedNFT) {
      return ['', ethers.BigNumber.from(-1)];
    }
    return [getNftContractAddress(selectedNFT), selectedNFT.identifier];
  }, [selectedNFT]);

  const initialIsCollateralApproved = useMemo(() => {
    return Boolean(selectedNFT && isNFTApprovedForCollateral(selectedNFT));
  }, [selectedNFT]);
  const [isCollateralApproved, setIsCollateralApproved] = useState(
    initialIsCollateralApproved,
  );
  const [submittingApproval, setSubmittingApproval] = useState(false);

  const state = useMemo(() => {
    if (!account) {
      return State.NotConnected;
    }
    if (!selectedNFT) {
      return State.NeedsToSelect;
    }
    if (!isCollateralApproved && !submittingApproval) {
      return State.NeedsToAuthorize;
    }
    if (submittingApproval) {
      return State.AuthorizationInProgress;
    }
    return State.Form;
  }, [account, isCollateralApproved, selectedNFT, submittingApproval]);

  const Explainer = useMemo(() => explainers[state], [state]);

  return (
    <div className={styles['create-page-header']}>
      <ThreeColumn>
        <NFTMedia
          collateralAddress={collateralAddress}
          collateralTokenID={collateralTokenID}
        />
        <div className={styles['button-container']}>
          <SelectNFTButton dialog={dialog} state={state} />
          <AuthorizeNFTButton
            state={state}
            collateralAddress={collateralAddress}
            collateralTokenID={collateralTokenID}
            setIsCollateralApproved={setIsCollateralApproved}
            setSubmittingApproval={setSubmittingApproval}
            submittingApproval={submittingApproval}
          />
          <CreatePageForm
            collateralAddress={collateralAddress}
            collateralTokenID={collateralTokenID}
            state={state}
          />
        </div>
        <Explainer />
      </ThreeColumn>
      <Provider value={eip721Client}>
        <NFTCollateralPicker
          hiddenNFTAddresses={HIDDEN_NFT_ADDRESSES}
          connectedWallet={account || ''}
          handleSetSelectedNFT={setSelectedNFT}
          dialog={dialog}
        />
      </Provider>
    </div>
  );
}

interface ButtonProps {
  state: State;
}

interface SelectNFTButtonProps extends ButtonProps {
  dialog: DialogStateReturn;
}
function SelectNFTButton({ state, dialog }: SelectNFTButtonProps) {
  const text = useMemo(() => 'Select an NFT', []);
  const isDisabled = state === State.NotConnected;
  const isDone = state > State.NeedsToSelect;

  if (isDisabled) {
    return <Button disabled>{text}</Button>;
  }
  if (isDone) {
    return <CompletedButton buttonText={text} success />;
  }

  return <DialogDisclosureButton {...dialog}>{text}</DialogDisclosureButton>;
}

interface AuthorizeNFTButtonProps extends ButtonProps {
  collateralTokenID: ethers.BigNumber;
  collateralAddress: string;
  setIsCollateralApproved: (value: boolean) => void;
  setSubmittingApproval: (value: boolean) => void;
  submittingApproval: boolean;
}
function AuthorizeNFTButton({
  collateralAddress,
  collateralTokenID,
  setIsCollateralApproved,
  setSubmittingApproval,
  state,
  submittingApproval,
}: AuthorizeNFTButtonProps) {
  const { account } = useWeb3();
  const [transactionHash, setTransactionHash] = useState('');

  const approve = useCallback(async () => {
    const web3Contract = web3Erc721Contract(collateralAddress);
    const t = await web3Contract.approve(
      process.env.NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT || '',
      collateralTokenID,
    );
    setTransactionHash(t.hash);
    setSubmittingApproval(true);
    t.wait()
      .then(() => {
        setSubmittingApproval(false);
        setIsCollateralApproved(true);
      })
      .catch((err) => {
        setSubmittingApproval(false);
        console.error(err);
      });
  }, [collateralAddress, collateralTokenID, setSubmittingApproval]);
  const text = useMemo(() => 'Authorize NFT', []);
  const isDisabled = state < State.NeedsToAuthorize;

  if (isDisabled) {
    return <Button disabled>{text}</Button>;
  }

  return (
    <TransactionButton
      text={text}
      onClick={approve}
      txHash={transactionHash}
      isPending={submittingApproval}
    />
  );
}
