import { createContext } from 'react';
import { createClient } from '@urql/core';

const nftBackedLoansClient = createClient({
  url: process.env.NEXT_PUBLIC_NFT_BACKED_LOANS_SUBGRAPH,
});

const eip721Client = createClient({
  url: process.env.NEXT_PUBLIC_EIP721_SUBGRAPH,
});

/**
 * Provides access to various urql client singletons. Due to the way the urql
 * React components work, you can only have one client for a given subtree of
 * components, which means we may have to do some juggling if we need to query
 * 2 different graphs on the same page.
 */
export const UrqlContext = createContext({
  nftBackedLoansClient,
  eip721Client,
});
