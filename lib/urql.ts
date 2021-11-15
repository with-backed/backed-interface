import { createClient } from '@urql/core';

export const nftBackedLoansClient = createClient({
  url: process.env.NEXT_PUBLIC_NFT_BACKED_LOANS_SUBGRAPH || '',
});

export const eip721Client = createClient({
  url: process.env.NEXT_PUBLIC_EIP721_SUBGRAPH || '',
});
