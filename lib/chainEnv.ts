export const mainnet = (): boolean => process.env.NEXT_PUBLIC_ENV === 'mainnet';

export const optimism = (): boolean =>
  process.env.NEXT_PUBLIC_ENV === 'optimism';

export const rinkeby = (): boolean => process.env.NEXT_PUBLIC_ENV === 'rinkeby';

export const siteUrl = (): string =>
  mainnet() ? 'https://withbacked.xyz' : 'https://rinkeby.withbacked.xyz';
