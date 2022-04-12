# pawn-shop-client-private

Otherwise known as the frontend component of `💸✨🎸 nft pawn shop 💍✨💸`

## Developing

Install all deps by running `yarn`

### Running on rinkeby

By default, just running `yarn dev` runs the frontend hooked up to the rinkeby testnet. Our app will allow you to mint NFTs and Rinkeby DAI at http://localhost:3000/test. You'll need some Rinkeby eth for gas.

### Running locally

1. Create `.env.local` (`touch .env.local`) with the below. Update `lib/contracts.ts` using locally deployed contract addresses (detailed instructions coming soon).

```
NEXT_PUBLIC_JSON_RPC_PROVIDER=http://localhost:8545
NEXT_PUBLIC_ETHERSCAN_URL="https://rinkeby.etherscan.io"
NEXT_PUBLIC_OPENSEA_URL="https://testnets.opensea.io"
```

2. `yarn install`
3. `yarn run dev`

### Tests

`yarn run test`

Note: you should expect to see `__tests/notifications/repository.ts` to fail if you do not have your local Docker postgres running
