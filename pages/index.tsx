import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Button, Header } from 'semantic-ui-react';
import ConnectWallet from '../components/ConnectWallet';
import utilStyles from '../styles/utils.module.css';

export default function Home() {
  return (
    <div>
      Welcome! Homepage in progress, try
      {' '}
      <Link href="/loans/create"> Creating a ticket </Link>
    </div>
  );
}

function MintDai() {}

function MintPunk() {}
