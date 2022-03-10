import { ethers } from 'ethers';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { useWeb3 } from 'hooks/useWeb3';
import React, { useCallback, useMemo } from 'react';

type WrongNetworkProps = {
  currentChainId: number;
  expectedChainId: number;
};
export const WrongNetwork = ({
  currentChainId,
  expectedChainId,
}: WrongNetworkProps) => {
  const { library } = useWeb3();
  const { addMessage } = useGlobalMessages();

  const handleClick = useCallback(async () => {
    try {
      await library!.jsonRpcFetchFunc('wallet_switchEthereumChain', [
        { chainId: `0x${expectedChainId.toString(16)}` },
      ]);
    } catch (e) {
      addMessage({
        kind: 'error',
        message:
          'Looks like your wallet does not support automatic network changes. Please change the network manually.',
      });
    }
  }, [addMessage, expectedChainId, library]);

  const currentChainName = useMemo(() => {
    const rawName = ethers.providers.getNetwork(currentChainId).name;
    return rawName[0].toUpperCase() + rawName.slice(1);
  }, [currentChainId]);

  const expectedChainName = useMemo(() => {
    const rawName = ethers.providers.getNetwork(expectedChainId).name;
    return rawName[0].toUpperCase() + rawName.slice(1);
  }, [expectedChainId]);

  return (
    <span>
      You&apos;re viewing data from the {expectedChainName} network, but your
      wallet is connected to the {currentChainName} network.{' '}
      <button onClick={handleClick}>Switch to {expectedChainName}</button>
    </span>
  );
};
