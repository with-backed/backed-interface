import { TextButton } from 'components/Button';
import { ethers } from 'ethers';
import { useGlobalMessages } from 'hooks/useGlobalMessages';
import React, { useCallback, useMemo } from 'react';
import { useNetwork } from 'wagmi';
import text from '../../../text/text.yml';
type WrongNetworkProps = {
  currentChainId: number;
  expectedChainId: number;
};

export const WrongNetwork = ({
  currentChainId,
  expectedChainId,
}: WrongNetworkProps) => {
  const [{}, switchNetwork] = useNetwork();
  const { addMessage } = useGlobalMessages();

  const handleClick = useCallback(async () => {
    try {
      await switchNetwork!(expectedChainId);
    } catch (e) {
      addMessage({
        kind: 'error',
        message: text.en.banner.switch_network_fail,
      });
    }
  }, [addMessage, expectedChainId, switchNetwork]);

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
      {text.en.banner.wrong_network_message
        .replace('${expectedChainName}', expectedChainName)
        .replace('${currentChainName}', currentChainName)}
      <TextButton kind="alert" onClick={handleClick}>
        Switch to {expectedChainName}
      </TextButton>
    </span>
  );
};
