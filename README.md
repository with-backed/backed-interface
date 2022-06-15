# backed-interface

![backed](/public/logos/backed-bunny.png 'backed')

## Developing

Install all deps by running `yarn`

### Running on rinkeby

By default, just running `yarn dev` runs the frontend hooked up to the rinkeby testnet. Our app will allow you to mint NFTs and Rinkeby DAI at http://localhost:3000/test. You'll need some Rinkeby eth for gas, you can request a small amount from [Chainlink](https://faucets.chain.link/rinkeby).

### Running on other chains

Coming soon after our deploy to mainnet.

### Setting up the notifications DB

We use postgres + prisma ORM to keep track of which users have requested to receive notifications (email, telegram, etc.). In order to spin up prisma, run `docker-compose up -d postgres`, then, add the following to your `.env.local`

```
DATABASE_URL=postgresql://user:password@localhost:5432/notifications?schema=public
```

Finally, you'll need to apply all our DB migrations to your new local instance. Do this by running `yarn prisma-migrate:test`.

### Tests

`yarn test`

Note: you should expect to see `__tests/notifications/repository.ts` to fail if you do not have your local Docker postgres running
