import { useMachine } from '@xstate/react';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { NFTMedia } from 'components/Media/NFTMedia';
import { NFTCollateralPicker } from 'components/NFTCollateralPicker/NFTCollateralPicker';
import { ethers } from 'ethers';
import { useWeb3 } from 'hooks/useWeb3';
import {
  getNftContractAddress,
  HIDDEN_NFT_ADDRESSES,
  NFTEntity,
} from 'lib/eip721Subraph';
import { eip721Client } from 'lib/urql';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDialogState } from 'reakit/Dialog';
import { Provider } from 'urql';
import { AuthorizeNFTButton } from './AuthorizeNFTButton';
import { CreateFormData } from './CreateFormData';
import { CreatePageForm } from './NewCreatePageForm';
import { createPageFormMachine, stateTargets } from './createPageFormMachine';
import styles from './CreatePageHeader.module.css';
import { Explainer } from './Explainer';
import { SelectNFTButton } from './SelectNFTButton';

export function CreatePageHeader() {
  const form = useForm<CreateFormData>({ mode: 'all' });
  const { account } = useWeb3();
  const [current, send] = useMachine(createPageFormMachine);

  const [selectedNFT, setSelectedNFT] = useState<NFTEntity | null>(null);
  const [collateralAddress, collateralTokenID] = useMemo(() => {
    if (!selectedNFT) {
      return ['', ethers.BigNumber.from(-1)];
    }
    return [getNftContractAddress(selectedNFT), selectedNFT.identifier];
  }, [selectedNFT]);
  const dialog = useDialogState();

  const handleSetSelectedNFT = useCallback(
    (nft: NFTEntity) => {
      setSelectedNFT(nft);
      send({ type: 'SELECTED' });
    },
    [setSelectedNFT, send],
  );

  const onAlreadyApproved = useCallback(() => {
    send({ type: 'ALREADY_APPROVED' });
  }, [send]);
  const onApproved = useCallback(() => {
    send({ type: 'SUCCESS' });
  }, [send]);
  const onSubmit = useCallback(() => {
    send({ type: 'SUBMITTED' });
  }, [send]);
  const onError = useCallback(() => {
    send({ type: 'FAILURE' });
  }, [send]);

  const onFocus = useCallback(
    (type: 'DENOMINATION' | 'LOAN_AMOUNT' | 'DURATION' | 'INTEREST_RATE') => {
      send({ type });
    },
    [send],
  );
  const onBlur = useCallback(
    (filled: boolean) => {
      if (filled) {
        send({ type: 'UNFOCUS_FULL' });
      } else {
        send({ type: 'UNFOCUS_EMPTY' });
      }
    },
    [send],
  );

  useEffect(() => {
    if (account && current.matches('noWallet')) {
      send({
        type: 'CONNECT',
      });
    }
  }, [account, current, send]);

  const context = form.watch();

  const [explainerTop, setExplainerTop] = useState(0);
  useEffect(() => {
    const targetID = stateTargets[current.toStrings()[0]];
    const target = document.getElementById(targetID);
    const container = document.getElementById('container');
    if (!target || !container) {
      setExplainerTop(0);
    }
    const targetTop = target!.getBoundingClientRect().top;
    const containerTop = container!.getBoundingClientRect().top;
    setExplainerTop(targetTop - containerTop);
  }, [current]);

  const formIsDisabled = useMemo(() => {
    return [
      'noWallet',
      'selectNFT',
      'authorizeNFT',
      'pendingAuthorization',
      'pendingMintBorrowerTicket',
      'mintBorrowerTicketSuccess',
      'mintBorrowerTicketFailure',
    ].some(current.matches);
  }, [current]);

  return (
    <div className={styles['create-page-header']}>
      <ThreeColumn>
        <NFTMedia
          collateralAddress={collateralAddress}
          collateralTokenID={collateralTokenID}
        />
        <div className={styles['button-container']}>
          <SelectNFTButton
            dialog={dialog}
            disabled={current.matches('noWallet')}
            done={!current.matches('selectNFT')}
          />
          <AuthorizeNFTButton
            collateralAddress={collateralAddress}
            collateralTokenID={collateralTokenID}
            disabled={!current.matches('authorizeNFT')}
            nft={selectedNFT}
            onAlreadyApproved={onAlreadyApproved}
            onApproved={onApproved}
            onError={onError}
            onSubmit={onSubmit}
          />
          <CreatePageForm
            collateralAddress={collateralAddress}
            collateralTokenID={collateralTokenID}
            disabled={formIsDisabled}
            onApproved={onApproved}
            onBlur={onBlur}
            onError={onError}
            onFocus={onFocus}
            onSubmit={onSubmit}
            form={form}
          />
        </div>
        <Explainer
          state={current.toStrings()[0]}
          top={explainerTop}
          context={context}
        />
      </ThreeColumn>
      <Provider value={eip721Client}>
        <NFTCollateralPicker
          hiddenNFTAddresses={HIDDEN_NFT_ADDRESSES}
          connectedWallet={account || ''}
          handleSetSelectedNFT={handleSetSelectedNFT}
          dialog={dialog}
        />
      </Provider>
    </div>
  );
}
