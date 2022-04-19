# backed-interface

![backed](/components/PawnShopHeader/backed-bunny.png 'backed')

## Developing

Install all deps by running `yarn`

### Running on rinkeby

By default, just running `yarn dev` runs the frontend hooked up to the rinkeby testnet. Our app will allow you to mint NFTs and Rinkeby DAI at http://localhost:3000/test. You'll need some Rinkeby eth for gas, you can request a small amount from [Chainlink](https://faucets.chain.link/rinkeby).

### Running on other chains

Coming soon after our deploy to mainnet.

### Tests

`yarn test`

Note: you should expect to see `__tests/notifications/repository.ts` to fail if you do not have your local Docker postgres running
