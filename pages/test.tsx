import { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { ethers } from 'ethers';
import { PawnShopHeader } from 'components/PawnShopHeader';
import { MockDAI__factory, MockPUNK__factory } from 'abis/types';
import { TransactionButton } from 'components/ticketPage/TransactionButton';
import { PageWrapper } from 'components/layouts/PageWrapper';
import { Fieldset } from 'components/Fieldset';
import { ThreeColumn } from 'components/layouts/ThreeColumn';

const ConnectWallet = dynamic(
  () => import('components/ConnectWallet').then(mod => mod.ConnectWallet),
  { ssr: false }
);

type TestProps = {
  mockDAIContract: string;
  mockPunkContract: string;
}

export const getServerSideProps: GetServerSideProps<TestProps> = async () => {
  const mockDAIContract = process.env.NEXT_PUBLIC_MOCK_DAI_CONTRACT;
  const mockPunkContract = process.env.NEXT_PUBLIC_MOCK_PUNK_CONTRACT;

  return {
    props: {
      mockDAIContract,
      mockPunkContract,
    }
  }
}

export default function Test({ mockDAIContract, mockPunkContract }: TestProps) {
  const [account, setAccount] = useState(null);

  return (
    <PageWrapper>
      <PawnShopHeader
        account={account}
        setAccount={setAccount}
        message="get an NFT and DAI"
      />
      <ThreeColumn>
        <Fieldset legend="mint an NFT">
          {account == null ? (
            <ConnectWallet
              account={account}
              addressSetCallback={setAccount}
            />
          )
            : (
              <MintPunk account={account} mockPunkContract={mockPunkContract} />
            )}
        </Fieldset>
        <Fieldset legend="mint DAI">
          {account == null ? (
            <ConnectWallet
              account={account}
              addressSetCallback={setAccount}
            />
          )
            : (
              <MintDAI account={account} mockDAIContract={mockDAIContract} />
            )}
        </Fieldset>
      </ThreeColumn>
    </PageWrapper>
  );
}

type MintPunkProps = {
  account: string;
  mockPunkContract: string;
};
function MintPunk({ account, mockPunkContract }: MintPunkProps) {
  const [txHash, setTxHash] = useState('');
  const [txPending, setTxPending] = useState(false);
  const [id, setId] = useState<ethers.BigNumber>(null);

  const mintPunk = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
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
    const filter = punk.filters.Transfer(
      null,
      account,
      null,
    );
    punk.once(filter, (from, to, tokenId) => {
      console.log(`token id ${tokenId}`);
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
        NFT contract address {mockPunkContract} (you will
        need this when creating a loan)
      </p>
      {Boolean(id) && <p>Minted token ID {id.toString()}</p>}
    </div>
  );
}

type MintDAIProps = {
  account: string;
  mockDAIContract: string;
}
function MintDAI({ account, mockDAIContract }: MintDAIProps) {
  const [txHash, setTxHash] = useState('');
  const [txPending, setTxPending] = useState(false);

  const mint = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(0);
    const dai = MockDAI__factory.connect(mockDAIContract, signer);
    const t = await dai.mint(ethers.BigNumber.from(10000), account);
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
    const filter = dai.filters.Transfer(
      null,
      account,
      null,
    );
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
        DAI contract address {mockDAIContract} (you will
        need this when creating a loan)
      </p>
    </div>
  );
}
