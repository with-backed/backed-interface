import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { useWeb3 } from 'hooks/useWeb3';
import React, { useCallback } from 'react';

const idToName: { [key: number]: string } = {
  1: 'Mainnet',
  3: 'Ropsten',
  4: 'Rinkeby',
  5: 'Goerli',
};

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

  return (
    <span>
      You&apos;re viewing data from the {idToName[expectedChainId]} network, but
      your wallet is connected to the {idToName[currentChainId]} network.{' '}
      <button onClick={handleClick}>
        Switch to {idToName[expectedChainId]}
      </button>
    </span>
  );
};
