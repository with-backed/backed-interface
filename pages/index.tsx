import Link from 'next/link';
import React from 'react';

export default function Home() {
  return (
    <div>
      Welcome! Homepage in progress, try
      <Link href="/loans/create">Creating a loan</Link>
    </div>
  );
}
