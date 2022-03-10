import { WrongNetwork } from 'components/Banner/messages';
import { useGlobalMessages, Message } from 'hooks/useGlobalMessages';
import { useWeb3 } from 'hooks/useWeb3';
import React, { useEffect, useState } from 'react';

const expectedChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID as string);

export function useNetworkMonitor() {
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const { chainId } = useWeb3();
  const { addMessage, removeMessage } = useGlobalMessages();

  useEffect(() => {
    if (currentMessage) {
      removeMessage(currentMessage);
    }
    if (chainId) {
      if (chainId !== expectedChainId) {
        const message: Message = {
          kind: 'error',
          message: (
            <WrongNetwork
              currentChainId={chainId}
              expectedChainId={expectedChainId}
            />
          ),
        };
        addMessage(message);
        setCurrentMessage(message);
      }
    }
  }, [addMessage, chainId, currentMessage, removeMessage]);
}
