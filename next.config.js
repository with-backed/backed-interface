const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer({
  swcMinify: false,
  compiler: {
    // remove properties matching the default regex ^data-test
    reactRemoveProperties: true,
  },
  // TODO: figure out CI to upload source maps to Bugsnag and then enable
  //productionBrowserSourceMaps: true,
});
