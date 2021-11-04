import Link from 'next/link';
import dynamic from 'next/dynamic';

const ConnectWallet = dynamic(
  () => import('components/ConnectWallet').then(mod => mod.ConnectWallet),
  { ssr: false }
);

export default function PawnShopHeader({ account, setAccount, message }) {
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
          {' '}
          {message}
          {' '}
        </h2>
      </div>
    </div>
  );
}
