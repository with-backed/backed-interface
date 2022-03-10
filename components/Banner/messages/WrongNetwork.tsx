import React from 'react';

type WrongNetworkProps = {
  currentChainId: number;
  expectedChainId: number;
};
export const WrongNetwork = ({
  currentChainId,
  expectedChainId,
}: WrongNetworkProps) => {
  return (
    <span>
      You&apos;re viewing data from network id {expectedChainId}, but your
      wallet is connected to {currentChainId}.{' '}
      <button>Switch to network {expectedChainId}</button>
    </span>
  );
};
