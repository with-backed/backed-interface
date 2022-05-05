import { ParsedUrlQuery } from 'querystring';
import { configs, SupportedNetwork } from 'lib/config';

const SUPPORTED_NETWORKS = new Set(Object.keys(configs));

export function isSupportedNetwork(
  network?: string,
): network is SupportedNetwork {
  return typeof network === 'string' && SUPPORTED_NETWORKS.has(network);
}

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
