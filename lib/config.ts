import { ParsedUrlQuery } from 'querystring';

const baseConfig = {
  centerCode: 'backed-xyz',
  infuraId: '54c753f04ec64374aa679e383e7f84d5',
  nftPortApiKey: '39de5023-b9ef-42cf-a730-ce98537d2d8d',
};

export type Config = {
  // things that aren't guaranteed to exist in all configs should be declared here
  nftSalesSubgraph: string | null;
} & Omit<typeof ethereum, 'nftSalesSubgraph'>;

export type SupportedNetwork = keyof typeof configs;

const rinkeby: Config = {
  ...baseConfig,
  centerNetwork: 'ethereum-rinkeby',
  chainId: 4,
  nftBackedLoansSubgraph:
    'https://api.thegraph.com/subgraphs/name/with-backed/backed-protocol-rinkeby',
  pirschCode: 'YJk8KXD6e5xIgVxoe6f9A1O1lSxQW3ky',
  jsonRpcProvider:
    'https://eth-rinkeby.alchemyapi.io/v2/BtHbvji7nhBOC943JJB2XoXMSJAh64g-',
  eip721Subgraph:
    'https://api.thegraph.com/subgraphs/name/sunguru98/erc721-rinkeby-subgraph',
  openSeaUrl: 'https://testnets.opensea.io',
  etherscanUrl: 'https://rinkeby.etherscan.io',
  nftSalesSubgraph: null,
  siteUrl: 'https://staging.withbacked.xyz',
  network: 'rinkeby',
  emailSubjectPrefix: '[Testnet]:',
  facilitatorStartBlock: 10550059,
};

const ethereum = {
  ...baseConfig,
  centerNetwork: 'ethereum-mainnet',
  nftBackedLoansSubgraph:
    'https://api.thegraph.com/subgraphs/name/with-backed/backed-protocol',
  nftSalesSubgraph:
    'https://api.thegraph.com/subgraphs/name/adamgobes/nft-sales-indexer',
  eip721Subgraph:
    'https://api.thegraph.com/subgraphs/name/sunguru98/mainnet-erc721-subgraph',
  infuraId: '54c753f04ec64374aa679e383e7f84d5',
  pirschCode: '82ZKa76zuhAYZcSHM5QpOGU8U4hY5f1l',
  openSeaUrl: 'https://opensea.io',
  etherscanUrl: 'https://etherscan.io',
  chainId: 1,
  jsonRpcProvider:
    'https://eth-mainnet.alchemyapi.io/v2/De3LMv_8CYuN9WzVEgoOI5w7ltnGIhnH',
  siteUrl: 'https://withbacked.xyz',
  network: 'ethereum',
  emailSubjectPrefix: '[Ethereum]:',
  facilitatorStartBlock: 14636317,
};

const optimism: Config = {
  ...baseConfig,
  centerNetwork: '',
  nftBackedLoansSubgraph:
    'https://api.thegraph.com/subgraphs/name/with-backed/backed-protocol-optimism',
  eip721Subgraph:
    'https://api.thegraph.com/subgraphs/name/with-backed/optimism-erc721-subgraph',
  infuraId: '54c753f04ec64374aa679e383e7f84d5',
  pirschCode: '82ZKa76zuhAYZcSHM5QpOGU8U4hY5f1l',
  openSeaUrl: 'https://quixotic.io',
  etherscanUrl: 'https://optimistic.etherscan.io',
  chainId: 10,
  jsonRpcProvider:
    'https://opt-mainnet.g.alchemy.com/v2/_K-HnfZvE5ChalM8ys4TQEkmsWn8CPTU',
  siteUrl: 'https://withbacked.xyz',
  network: 'optimism',
  emailSubjectPrefix: '[Optimism]:',
  nftSalesSubgraph: null,
  facilitatorStartBlock: 6679943,
};

export const configs = {
  ethereum,
  rinkeby,
  optimism,
};

export const prodConfigs = [ethereum, optimism];

export const devConfigs = [rinkeby];

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
