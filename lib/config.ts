const baseConfig = {
  centerCode: 'backed-xyz',
  infuraId: '54c753f04ec64374aa679e383e7f84d5',
  nftPortApiKey: '39de5023-b9ef-42cf-a730-ce98537d2d8d',
  // TODO: set this for each env
  facilitatorStartBlock: 0,
};

type Config = {
  // things that aren't guaranteed to exist in all configs should be declared here
  nftSalesSubgraph: string | null;
  onEthereumMainnet?: boolean;
  onEthereumRinkeby?: boolean;
  onOptimismMainnet?: boolean;
} & Omit<
  typeof ethereumMainnetConfig,
  'nftSalesSubgraph' | 'onEthereumMainnet'
>;

const ethereumRinkebyConfig: Config = {
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
  onEthereumRinkeby: true,
  siteUrl: 'https://rinkeby.withbacked.xyz',
};

const ethereumMainnetConfig = {
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
  onEthereumMainnet: true,
  siteUrl: 'https://withbacked.xyz',
};

export const config: Config = (() => {
  const env = process.env.NEXT_PUBLIC_ENV;

  if (!env) {
    throw new Error('NEXT_PUBLIC_ENV is falsy, cannot build app.');
  }

  switch (env) {
    case 'ethereum-mainnet':
      return ethereumMainnetConfig;
    case 'ethereum-rinkeby':
      return ethereumRinkebyConfig;
    default:
      throw new Error(
        `NEXT_PUBLIC_ENV is unsupported value (${env}), cannot build app.`,
      );
  }
})();
