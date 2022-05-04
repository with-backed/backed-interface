import { createClient } from '@urql/core';
import { config } from 'lib/config';

// The local document cache is not very useful in our use case, because it
// caches everything and only invalidates when there's a mutation. We never
// perform mutations on data in the subgraphs, so our local cache would never
// be invalidated.
const requestPolicy = 'network-only';

export const nftBackedLoansClient = createClient({
  url: config.nftBackedLoansSubgraph,
  requestPolicy,
});

export const eip721Client = createClient({
  url: config.eip721Subgraph,
  requestPolicy,
});

export const nftSalesClient = createClient({
  // TODO: is there a better way to handle this absence?
  url: config.nftSalesSubgraph || '',
  requestPolicy,
});
