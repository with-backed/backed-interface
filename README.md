# pawn-shop-client-private

Otherwise known as the frontend component of `💸✨🎸 nft pawn shop 💍✨💸`

## Developing

Install all deps by running `yarn`

### Running on rinkeby

By default, just running `yarn dev` runs the frontend hooked up to the rinkeby testnet. Our app will allow you to mint NFTs and Rinkeby DAI at http://localhost:3000/test. You'll need some Rinkeby eth for gas.

### Running locally

1. Create `.env.local` (`touch .env.local`) with the below. Update using locally deployed contract addresses (detailed instructions coming soon).

```
NEXT_PUBLIC_JSON_RPC_PROVIDER=http://localhost:8545
NEXT_PUBLIC_NFT_LOAN_FACILITATOR_CONTRACT=0x74Cf9087AD26D541930BaC724B7ab21bA8F00a27
NEXT_PUBLIC_PAWN_LOANS_CONTRACT=0xefAB0Beb0A557E452b398035eA964948c750b2Fd
NEXT_PUBLIC_PAWN_TICKETS_CONTRACT=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D
NEXT_PUBLIC_ETHERSCAN_URL="https://rinkeby.etherscan.io"
NEXT_PUBLIC_OPENSEA_URL="https://testnets.opensea.io"
```

2. `yarn install`
3. `yarn run dev`
