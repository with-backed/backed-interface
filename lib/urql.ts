import { createClient } from '@urql/core';

// The local document cache is not very useful in our use case, because it
// caches everything and only invalidates when there's a mutation. We never
// perform mutations on data in the subgraphs, so our local cache would never
// be invalidated.
const requestPolicy = 'network-only';

export function clientFromUrl(url: string) {
  return createClient({
    url,
    requestPolicy,
  });
}
