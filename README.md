### Running locally 
1. Create `.env.local` (`touch .env.local`) with the below. Update using locally deployed contract addresses
```
NEXT_PUBLIC_JSON_RPC_PROVIDER=http://localhost:8545
NEXT_PUBLIC_NFT_PAWN_SHOP_CONTRACT=0x74Cf9087AD26D541930BaC724B7ab21bA8F00a27
NEXT_PUBLIC_PAWN_LOANS_CONTRACT=0xefAB0Beb0A557E452b398035eA964948c750b2Fd
NEXT_PUBLIC_PAWN_TICKETS_CONTRACT=0xaca81583840B1bf2dDF6CDe824ada250C1936B4D
NEXT_PUBLIC_ETHERSCAN_URL="https://rinkeby.etherscan.io"
NEXT_PUBLIC_OPENSEA_URL="https://testnets.opensea.io"
```
2. `yarn install`
3. `yarn run dev`
