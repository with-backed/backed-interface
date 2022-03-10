import React from 'react';

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
  return (
    <span>
      You&apos;re viewing data from the {idToName[expectedChainId]} network, but
      your wallet is connected to the {idToName[currentChainId]} network.{' '}
      <button>Switch to {idToName[expectedChainId]}</button>
    </span>
  );
};
