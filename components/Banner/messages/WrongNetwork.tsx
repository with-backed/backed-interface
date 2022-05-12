import { TextButton } from 'components/Button';
import { ethers } from 'ethers';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import React, { useCallback, useMemo } from 'react';
import { useNetwork } from 'wagmi';
import { Banner } from '../Banner';

type WrongNetworkProps = {
  expectedChainId: number;
  expectedChainName: string;
};
export const WrongNetwork = ({
  expectedChainId,
  expectedChainName,
}: WrongNetworkProps) => {
  const [{ data }, switchNetwork] = useNetwork();
  const { addMessage } = useGlobalMessages();

  const chainId = data.chain?.id;

  const handleClick = useCallback(async () => {
    try {
      await switchNetwork!(expectedChainId);
    } catch (e) {
      addMessage({
        kind: 'error',
        message:
          'Looks like your wallet does not support automatic network changes. Please change the network manually.',
      });
    }
  }, [addMessage, expectedChainId, switchNetwork]);

  const currentChainName = useMemo(() => {
    if (chainId) {
      const rawName = ethers.providers.getNetwork(chainId).name;
      if (rawName.toLowerCase() === 'homestead') {
        return 'Ethereum';
      }
      return rawName[0].toUpperCase() + rawName.slice(1);
    }
    return '';
  }, [chainId]);

  const formattedExpectedName = useMemo(
    () => expectedChainName[0].toUpperCase() + expectedChainName.slice(1),
    [expectedChainName],
  );

  if (chainId && chainId !== expectedChainId) {
    return (
      <Banner kind="error">
        <span>
          You&apos;re viewing data from the {formattedExpectedName} network, but
          your wallet is connected to the {currentChainName} network.{' '}
          <TextButton kind="alert" onClick={handleClick}>
            Switch wallet to {formattedExpectedName}
          </TextButton>
        </span>
      </Banner>
    );
  }

  return null;
};
