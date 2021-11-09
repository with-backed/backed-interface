import Link from 'next/link';
import React from 'react';

export default function Home() {
  return (
    <div>
      <p>
        Welcome! Homepage in progress, try <Link href="/loans/create"> Creating a loan</Link>
      </p>
      <p>
        {
          process.env.NEXT_PUBLIC_ENV === 'rinkeby' ?
            <Link href="/test">Get Rinkeby DAI and an NFT!</Link>
            : ''
        }
      </p>
    </div>
  );
}
