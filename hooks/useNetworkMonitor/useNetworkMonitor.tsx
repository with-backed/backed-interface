import { WrongNetwork } from 'components/Banner/messages';
import { useGlobalMessages, Message } from 'hooks/useGlobalMessages';
import { useWeb3 } from 'hooks/useWeb3';
import React, { useEffect, useState } from 'react';

const expectedChainId = parseInt(process.env.NEXT_PUBLIC_CHAIN_ID as string);

export function useNetworkMonitor() {
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const { chainId } = useWeb3();
  const { addMessage, removeMessage } = useGlobalMessages();

  useEffect(() => {
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
        setCurrentMessages((prev) => [...prev, message]);
      }
    }
  }, [addMessage, chainId]);

  useEffect(() => {
    if (chainId) {
      if (chainId === expectedChainId && currentMessages.length > 0) {
        currentMessages.forEach((m) => removeMessage(m));
        setCurrentMessages([]);
      }
    }
  }, [chainId, currentMessages, removeMessage, setCurrentMessages]);
}
