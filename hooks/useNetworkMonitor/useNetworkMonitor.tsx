import { WrongNetwork } from 'components/Banner/messages';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import { useWeb3 } from 'hooks/useWeb3';
import React, { useEffect } from 'react';

const expectedChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID as string);

export function useNetworkMonitor() {
  const { chainId } = useWeb3();
  const { addMessage } = useGlobalMessages();
  useEffect(() => {
    if (chainId) {
      if (chainId !== expectedChainId) {
        addMessage({
          kind: 'error',
          message: (
            <WrongNetwork
              currentChainId={chainId}
              expectedChainId={expectedChainId}
            />
          ),
        });
      }
    }
  }, [addMessage, chainId]);
}
