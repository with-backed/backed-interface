export const mainnet = (): boolean => process.env.NEXT_PUBLIC_ENV === 'mainnet';

export const siteUrl = (): string =>
  mainnet() ? 'https://withbacked.xyz' : 'https://rinkeby.withbacked.xyz';
