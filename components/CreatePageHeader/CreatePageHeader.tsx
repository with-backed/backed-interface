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
import { useDialogState } from 'reakit/Dialog';
import { Provider } from 'urql';
import { AuthorizeNFTButton } from './AuthorizeNFTButton';
import { CreatePageForm } from './CreatePageForm';
import { createPageFormMachine } from './createPageFormMachine';
import styles from './CreatePageHeader.module.css';
import { ExplainerContext, explainers } from './explainers';
import { SelectNFTButton } from './SelectNFTButton';

export function CreatePageHeader() {
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

  const [interestRate, setInterestRate] = useState<number | null>(null);
  const [loanAmount, setLoanAmount] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const context: ExplainerContext = useMemo(
    () => ({ duration, interestRate, loanAmount }),
    [duration, interestRate, loanAmount],
  );

  console.log({ strings: current.toStrings() });

  const Explainer = useMemo(
    () => (explainers as any)[current.toStrings()[0]] || (() => null),
    [current],
  );

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
            disabled={
              current.matches('noWallet') ||
              current.matches('selectNFT') ||
              current.matches('authorizeNFT') ||
              current.matches('pendingAuthorization')
            }
            onFocus={onFocus}
            onBlur={onBlur}
            setDuration={setDuration}
            setInterestRate={setInterestRate}
            setLoanAmount={setLoanAmount}
          />
        </div>
        <Explainer context={context} />
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
