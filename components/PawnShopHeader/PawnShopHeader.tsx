import React, { FunctionComponent } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const ConnectWallet = dynamic(
  () => import('components/ConnectWallet').then(mod => mod.ConnectWallet),
  { ssr: false }
);

type PawnShopHeaderProps = {
  account?: string;
  setAccount: (account: string) => void;
  message: string;
};

export const PawnShopHeader: FunctionComponent<PawnShopHeaderProps> = ({
  account,
  setAccount,
  message
}) => {
  return (
    <div id="pawnShopHeader">
      <h1 id='home-link'>
        <Link href="/">
          💸✨🎸 nft pawn shop 💍✨💸
        </Link>
      </h1>
      <div id="header-connect-address-wrapper">
        <ConnectWallet
          account={account}
          addressSetCallback={setAccount}
        />
      </div>
      <div id="pawnShopHeaderDivider">
        <h2>
          {message}
        </h2>
      </div>
    </div>
  );
}
