const requiredEnvVars = [
  'NEXT_PUBLIC_ENV',
  'NEXT_PUBLIC_CHAIN_ID',
  'NEXT_PUBLIC_JSON_RPC_PROVIDER',
  'NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT',
  'NEXT_PUBLIC_LEND_TICKET_CONTRACT',
  'NEXT_PUBLIC_BORROW_TICKET_CONTRACT',
  'NEXT_PUBLIC_MOCK_DAI_CONTRACT',
  'NEXT_PUBLIC_MOCK_PUNK_CONTRACT',
  'NEXT_PUBLIC_ETHERSCAN_URL',
  'NEXT_PUBLIC_OPENSEA_URL',
  'NEXT_PUBLIC_FACILITATOR_START_BLOCK',
  'NEXT_PUBLIC_NFT_BACKED_LOANS_SUBGRAPH',
  'NEXT_PUBLIC_EIP721_SUBGRAPH',
  'NEXT_PUBLIC_NFT_SALES_SUBGRAPH',
  'NEXT_PUBLIC_NFT_PORT_API_KEY',
  'NEXT_PUBLIC_NOTIFICATION_REQ_MESSAGE',
  'DATABASE_URL',
  'NEXT_PUBLIC_PAWN_SHOP_API_URL',
  'NEXT_PUBLIC_NOTIFICATIONS_FREQUENCY_HOURS',
  'NEXT_PUBLIC_COINGECKO_ETH_ID',
  'EVENTS_API_SECRET_KEY',
];

// Fail Vercel deployments if project doesn't have the necessary
// environment variables. These won't be checked for local builds.
if (process.env.VERCEL) {
  requiredEnvVars.forEach((element) => {
    if (!process.env[element]) {
      throw new Error(`Environment variable '${element}' isn't defined`);
    }
  });
}

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({
  swcMinify: true,
  compiler: {
    // remove properties matching the default regex ^data-test
    reactRemoveProperties: true,
  },
});
