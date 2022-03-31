import { createClient } from '@urql/core';

// The local document cache is not very useful in our use case, because it
// caches everything and only invalidates when there's a mutation. We never
// perform mutations on data in the subgraphs, so our local cache would never
// be invalidated.
const requestPolicy = 'network-only';

export const nftBackedLoansClient = createClient({
  url: process.env.NEXT_PUBLIC_NFT_BACKED_LOANS_SUBGRAPH || '',
  requestPolicy,
});

export const eip721Client = createClient({
  url: process.env.NEXT_PUBLIC_EIP721_SUBGRAPH || '',
  requestPolicy,
});

export const nftSalesClient = createClient({
  url: process.env.NEXT_PUBLIC_NFT_SALES_SUBGRAPH || '',
  requestPolicy,
});
