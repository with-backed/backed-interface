export const onMainnet: boolean = process.env.NEXT_PUBLIC_ENV === 'mainnet';

export const onOptimism: boolean = process.env.NEXT_PUBLIC_ENV === 'optimism';

export const onRinkeby: boolean = process.env.NEXT_PUBLIC_ENV === 'rinkeby';

export const siteUrl = (): string =>
  onMainnet ? 'https://withbacked.xyz' : 'https://rinkeby.withbacked.xyz';
