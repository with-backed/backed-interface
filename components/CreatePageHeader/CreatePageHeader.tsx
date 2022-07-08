import { yupResolver } from '@hookform/resolvers/yup';
import { useMachine } from '@xstate/react';
import { ThreeColumn } from 'components/layouts/ThreeColumn';
import { NFTMedia } from 'components/Media/NFTMedia';
import { NFTCollateralPicker } from 'components/NFTCollateralPicker/NFTCollateralPicker';
import { ethers } from 'ethers';
import { getNftContractAddress, hiddenNFTAddresses } from 'lib/eip721Subraph';
import { clientFromUrl } from 'lib/urql';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDialogState } from 'reakit/Dialog';
import { Provider } from 'urql';
import { AuthorizeNFTButton } from './AuthorizeNFTButton';
import { CreateFormData } from './CreateFormData';
import { CreatePageForm } from './CreatePageForm';
import { createPageFormMachine, stateTargets } from './createPageFormMachine';
import styles from './CreatePageHeader.module.css';
import { Explainer } from './Explainer';
import { SelectNFTButton } from './SelectNFTButton';
import { createPageFormSchema } from './createPageFormSchema';
import { NFTEntity } from 'types/NFT';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { useAccount } from 'wagmi';
import { Button } from 'components/Button';
import { useConfig } from 'hooks/useConfig';
import { SupportedNetwork } from 'lib/config';

export function CreatePageHeader() {
  const form = useForm<CreateFormData>({
    mode: 'all',
    resolver: yupResolver(createPageFormSchema),
    defaultValues: {
      acceptHigherLoanAmounts: true,
    },
  });
  const { eip721Subgraph, network } = useConfig();
  const { address } = useAccount();
  const [current, send] = useMachine(createPageFormMachine);

  const [selectedNFT, setSelectedNFT] = useState<NFTEntity | null>(null);
  const [collateralContractAddress, collateralTokenId] = useMemo(() => {
    if (!selectedNFT) {
      return ['', ethers.BigNumber.from(-1)];
    }
    return [getNftContractAddress(selectedNFT), selectedNFT.identifier];
  }, [selectedNFT]);

  const tokenSpec = useMemo(
    () => ({ collateralContractAddress, collateralTokenId }),
    [collateralContractAddress, collateralTokenId],
  );

  const nftInfo = useTokenMetadata(tokenSpec);

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
  const onSetLoanTerms = useCallback(() => {
    send({ type: 'SET' });
  }, [send]);

  const onFocus = useCallback(
    (
      type:
        | 'DENOMINATION'
        | 'LOAN_AMOUNT'
        | 'DURATION'
        | 'INTEREST_RATE'
        | 'REVIEW'
        | 'ACCEPT_HIGHER_LOAN_AMOUNT',
    ) => {
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
    if (address && current.matches('noWallet')) {
      send({
        type: 'CONNECT',
      });
    }
  }, [address, current, send]);

  const errors = form.formState.errors;

  const [explainerTop, setExplainerTop] = useState(0);
  useEffect(() => {
    // when there's a form error, the explainer should float by the input with an error.
    const errorTarget = Object.keys(errors)[0];
    const stateTarget = stateTargets[current.toStrings()[0]];
    const targetID = errorTarget || stateTarget;
    const target = document.getElementById(targetID);
    const container = document.getElementById('container');
    if (!target || !container) {
      setExplainerTop(0);
      return;
    }
    const targetTop = target!.getBoundingClientRect().top;
    const containerTop = container!.getBoundingClientRect().top;
    const result = targetTop - containerTop;
    if (result !== explainerTop) {
      setExplainerTop(result);
    }
  }, [current, errors, explainerTop]);

  const formIsDisabled = useMemo(() => {
    return [
      'noWallet',
      'selectNFT',
      'authorizeNFT',
      'pendingAuthorization',
      'pendingMintBorrowerTicket',
      'mintBorrowerTicketSuccess',
      'mintBorrowerTicketFailure',
      'setLoanTerms',
    ].some(current.matches);
  }, [current]);

  const nftButtonState = useMemo(() => {
    if (current.matches('noWallet')) {
      return 'disabled';
    }
    if (selectedNFT) {
      return 'selected';
    }
    return 'active';
  }, [current, selectedNFT]);

  const setTermsButtonIsDisabled = useMemo(() => {
    return [
      'noWallet',
      'selectNFT',
      'authorizeNFT',
      'pendingAuthorization',
    ].some(current.matches);
  }, [current]);

  const eip721Client = useMemo(() => {
    return clientFromUrl(eip721Subgraph);
  }, [eip721Subgraph]);

  const hiddenNFTs = useMemo(
    () => hiddenNFTAddresses(network as SupportedNetwork),
    [network],
  );

  return (
    <div className={styles['create-page-header']}>
      <ThreeColumn>
        <NFTMedia nftInfo={nftInfo} />
        <div className={styles['button-container']}>
          <SelectNFTButton dialog={dialog} state={nftButtonState} />
          <AuthorizeNFTButton
            collateralAddress={collateralContractAddress}
            collateralTokenID={collateralTokenId}
            disabled={!selectedNFT}
            nft={selectedNFT}
            onAlreadyApproved={onAlreadyApproved}
            onApproved={onApproved}
            onError={onError}
            onSubmit={onSubmit}
          />
          <Button
            kind={current.matches('setLoanTerms') ? 'primary' : 'secondary'}
            disabled={setTermsButtonIsDisabled}
            id="setLoanTerms"
            onClick={onSetLoanTerms}>
            Set Loan Terms
          </Button>
          <CreatePageForm
            collateralAddress={collateralContractAddress}
            collateralTokenID={collateralTokenId}
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
          form={form}
        />
      </ThreeColumn>
      <Provider value={eip721Client}>
        <NFTCollateralPicker
          hiddenNFTAddresses={hiddenNFTs}
          connectedWallet={address || ''}
          handleSetSelectedNFT={handleSetSelectedNFT}
          dialog={dialog}
        />
      </Provider>
    </div>
  );
}
