import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { ethers } from 'ethers';
import PawnShopHeader from '../components/PawnShopHeader';
import { MockDAI__factory, MockPUNK__factory } from '../abis/types';
import TransactionButton from '../components/ticketPage/TransactionButton';

const ConnectWallet = dynamic(() => import('../components/ConnectWallet'), {
  ssr: false,
});

export default function Test({}) {
  const [account, setAccount] = useState(null);

  return (
    <div id="ticket-page-wrapper">
      <PawnShopHeader
        account={account}
        setAccount={setAccount}
        message="get a PUNK and DAI"
      />

      <fieldset className="standard-fieldset float-left">
        <legend> mint a PUNK </legend>
        {account == null ? (
          <ConnectWallet
            account={account}
            addressSetCallback={setAccount}
            buttonType={1}
          />
        )
          : (
            <MintPunk account={account} />
          )}
      </fieldset>

      <fieldset id="create-explainer-fieldset" className="standard-fieldset float-left">
        <legend> mint DAI </legend>
        {account == null ? (
          <ConnectWallet
            account={account}
            addressSetCallback={setAccount}
            buttonType={1}
          />
        )
          : (
            <MintDAI account={account} />
          )}
      </fieldset>
    </div>
  );
}

function MintPunk({ account }: { account: string }) {
  const [txHash, setTxHash] = useState('');
  const [txPending, setTxPending] = useState(false);
  const [id, setId] = useState<ethers.BigNumber>(null);

  const mintPunk = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(0);
    const punk = MockPUNK__factory.connect(process.env.NEXT_PUBLIC_MOCK_PUNK_CONTRACT, signer);
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
    const punk = MockPUNK__factory.connect(process.env.NEXT_PUBLIC_MOCK_PUNK_CONTRACT, provider);
    const filter = punk.filters.Transfer(
      null,
      account,
      null,
    );
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
        {`PUNK contract address ${process.env.NEXT_PUBLIC_MOCK_PUNK_CONTRACT} (you will 
        need this when creating a loan)`}
      </p>
      {id == null ? '' : <p>{`Minted PUNK id ${id.toString()}`}</p>}
    </div>
  );
}

function MintDAI({ account }: { account: string }) {
  const [txHash, setTxHash] = useState('');
  const [txPending, setTxPending] = useState(false);

  const mint = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner(0);
    const dai = MockDAI__factory.connect(process.env.NEXT_PUBLIC_MOCK_DAI_CONTRACT, signer);
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
    const dai = MockDAI__factory.connect(process.env.NEXT_PUBLIC_MOCK_DAI_CONTRACT, provider);
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
        {`DAI contract address ${process.env.NEXT_PUBLIC_MOCK_DAI_CONTRACT} (you will 
        need this when creating a loan)`}
      </p>
    </div>
  );
}
