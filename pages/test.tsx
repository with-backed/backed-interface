import React, { useState } from 'react';
import { ethers } from 'ethers';
import { MockDAI__factory, MockPUNK__factory } from 'types/generated/abis';
import { Fieldset } from 'components/Fieldset';
import { ConnectWallet } from 'components/ConnectWallet';
import { useWeb3 } from 'hooks/useWeb3';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { TransactionButton } from 'components/Button';

export default function Test() {
  const { account } = useWeb3();
  return (
    <TwelveColumn>
      <Fieldset
        style={{ gridColumn: 'span 6', marginTop: 'var(--gap)' }}
        legend="mint an NFT">
        {account == null ? <ConnectWallet /> : <MintPunk />}
      </Fieldset>
      <Fieldset
        style={{ gridColumn: 'span 6', marginTop: 'var(--gap)' }}
        legend="mint DAI">
        {account == null ? <ConnectWallet /> : <MintDAI />}
      </Fieldset>
    </TwelveColumn>
  );
}

function MintPunk() {
  const { account, library } = useWeb3();
  const [txHash, setTxHash] = useState('');
  const [txPending, setTxPending] = useState(false);
  const [id, setId] = useState<ethers.BigNumber | null>(null);
  const mockPunkContract = process.env.NEXT_PUBLIC_MOCK_PUNK_CONTRACT || '';
  const mintPunk = async () => {
    const provider = library!;
    const signer = provider.getSigner(0);
    const punk = MockPUNK__factory.connect(mockPunkContract, signer);
    const t = await punk.mint();
    setTxHash(t.hash);
    setTxPending(true);
    t.wait()
      .then((receipt) => {
        wait();
      })
      .catch((err) => {
        setTxPending(false);
        console.log(err);
      });
  };

  const wait = async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER,
    );
    const punk = MockPUNK__factory.connect(mockPunkContract, provider);
    const filter = punk.filters.Transfer(null, account, null);
    punk.once(filter, (from, to, tokenId) => {
      setTxPending(false);
      setId(tokenId);
    });
  };

  return (
    <div>
      <TransactionButton
        text="mint"
        onClick={mintPunk}
        txHash={txHash}
        isPending={txPending}
      />
      <p>
        NFT contract address {mockPunkContract} (you will need this when
        creating a loan)
      </p>
      {id !== null && <p>Minted token ID {id.toString()}</p>}
    </div>
  );
}

function MintDAI() {
  const { account, library } = useWeb3();
  const [txHash, setTxHash] = useState('');
  const [txPending, setTxPending] = useState(false);
  const mockDAIContract = process.env.NEXT_PUBLIC_MOCK_DAI_CONTRACT || '';

  const mint = async () => {
    const provider = library!;
    const signer = provider.getSigner(0);
    const dai = MockDAI__factory.connect(mockDAIContract, signer);
    const t = await dai.mint(ethers.BigNumber.from(10000), account as string);
    setTxHash(t.hash);
    setTxPending(true);
    t.wait()
      .then((receipt) => {
        wait();
      })
      .catch((err) => {
        setTxPending(false);
        console.log(err);
      });
  };

  const wait = async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_JSON_RPC_PROVIDER,
    );
    const dai = MockDAI__factory.connect(mockDAIContract, provider);
    const filter = dai.filters.Transfer(null, account, null);
    dai.once(filter, (from, to, value) => {
      setTxPending(false);
    });
  };

  return (
    <div>
      <TransactionButton
        text="mint"
        onClick={mint}
        txHash={txHash}
        isPending={txPending}
      />
      <p>
        DAI contract address {mockDAIContract} (you will need this when creating
        a loan)
      </p>
    </div>
  );
}
