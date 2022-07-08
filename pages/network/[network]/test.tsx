import React, { useState } from 'react';
import { ethers } from 'ethers';
import { MockDAI__factory, MockPUNK__factory } from 'types/generated/abis';
import { Fieldset } from 'components/Fieldset';
import { ConnectWallet } from 'components/ConnectWallet';
import { TwelveColumn } from 'components/layouts/TwelveColumn';
import { TransactionButton } from 'components/Button';
import { useAccount, useSigner } from 'wagmi';
import Head from 'next/head';
import { captureException } from '@sentry/nextjs';
import { GetServerSideProps } from 'next';
import { useConfig } from 'hooks/useConfig';

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  if (context.params?.network !== 'rinkeby') {
    return {
      notFound: true,
    };
  }
  return {
    props: {},
  };
};

export default function Test() {
  const { address } = useAccount();
  return (
    <>
      <Head>
        <title>Backed | Test</title>
        <meta
          name="description"
          content="Mint testnet DAI and NFTs to try out Backed protocol on Rinkeby"
        />
      </Head>
      <TwelveColumn>
        <Fieldset
          style={{ gridColumn: 'span 6', marginTop: 'var(--gap)' }}
          legend="mint an NFT">
          {address == null ? <ConnectWallet /> : <MintPunk />}
        </Fieldset>
        <Fieldset
          style={{ gridColumn: 'span 6', marginTop: 'var(--gap)' }}
          legend="mint DAI">
          {address == null ? <ConnectWallet /> : <MintDAI />}
        </Fieldset>
      </TwelveColumn>
    </>
  );
}

function MintPunk() {
  const { jsonRpcProvider } = useConfig();
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const [txHash, setTxHash] = useState('');
  const [txPending, setTxPending] = useState(false);
  const [id, setId] = useState<ethers.BigNumber | null>(null);
  const mockPunkContract = process.env.NEXT_PUBLIC_MOCK_PUNK_CONTRACT || '';
  const mintPunk = async () => {
    const punk = MockPUNK__factory.connect(mockPunkContract, signer!);
    const t = await punk.mint();
    setTxHash(t.hash);
    setTxPending(true);
    t.wait()
      .then((receipt) => {
        wait();
      })
      .catch((err) => {
        setTxPending(false);
        captureException(err);
      });
  };

  const wait = async () => {
    const provider = new ethers.providers.JsonRpcProvider(jsonRpcProvider);
    const punk = MockPUNK__factory.connect(mockPunkContract, provider);
    const filter = punk.filters.Transfer(null, address, null);
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
  const { jsonRpcProvider } = useConfig();
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const [txHash, setTxHash] = useState('');
  const [txPending, setTxPending] = useState(false);
  const mockDAIContract = process.env.NEXT_PUBLIC_MOCK_DAI_CONTRACT || '';

  const mint = async () => {
    const dai = MockDAI__factory.connect(mockDAIContract, signer!);
    const t = await dai.mint(ethers.BigNumber.from(10000), address as string);
    setTxHash(t.hash);
    setTxPending(true);
    t.wait()
      .then((receipt) => {
        wait();
      })
      .catch((err) => {
        setTxPending(false);
        captureException(err);
      });
  };

  const wait = async () => {
    const provider = new ethers.providers.JsonRpcProvider(jsonRpcProvider);
    const dai = MockDAI__factory.connect(mockDAIContract, provider);
    const filter = dai.filters.Transfer(null, address, null);
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
