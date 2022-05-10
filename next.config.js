const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const { withSentryConfig } = require('@sentry/nextjs');

const moduleExports = {
  swcMinify: false,
  compiler: {
    // remove properties matching the default regex ^data-test
    reactRemoveProperties: true,
  },
  images: {
    domains: ['nftpawnshop.mypinata.cloud'],
  },
  async redirects() {
    return [
      { source: '/', destination: '/network/ethereum', permanent: false },
      {
        source: '/loans/:id',
        destination: '/network/ethereum/loans/:id',
        permanent: false,
      },
      {
        source: '/loans/create',
        destination: '/network/ethereum/loans/create',
        permanent: false,
      },
      {
        source: '/profile/:address',
        destination: '/network/ethereum/profile/:address',
        permanent: false,
      },
      {
        source: '/test',
        destination: '/network/rinkeby/test',
        permanent: false,
      },
    ];
  },
};

const shouldInitializeSentry = !process.env.GITHUB_ACTIONS;

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = shouldInitializeSentry
  ? withSentryConfig(
      withBundleAnalyzer(moduleExports),
      sentryWebpackPluginOptions,
    )
  : withBundleAnalyzer(moduleExports);
