import { ParsedUrlQuery } from 'querystring';

const SUPPORTED_NETWORKS = new Set([
  'ethereum',
  'rinkeby',
  'optimism',
  'polygon',
]);

export function validateNetwork(query: ParsedUrlQuery) {
  const network = query.network as string;

  if (!network) {
    throw new Error('No network specified in path, cannot render.');
  }

  if (!SUPPORTED_NETWORKS.has(network)) {
    throw new Error(`${network} is not a supported network.`);
  }

  return true;
}
