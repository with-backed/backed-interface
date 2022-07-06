import { ethers } from 'ethers';

export const SECONDS_IN_A_DAY = 60 * 60 * 24;
export const SECONDS_IN_AN_HOUR = 60 * 60;
export const SECONDS_IN_A_YEAR = 31_536_000;
export const INTEREST_RATE_PERCENT_DECIMALS = 3;
export const MIN_RATE = 1 / 10 ** (INTEREST_RATE_PERCENT_DECIMALS - 2);

export const SCALAR = ethers.BigNumber.from(10).pow(
  INTEREST_RATE_PERCENT_DECIMALS,
);

export const DISCORD_URL = 'https://discord.gg/ZCxGuE6Ytk';
export const DISCORD_ERROR_CHANNEL = '#🪲bug-reports';
export const TWITTER_URL = 'https://twitter.com/backed_xyz';
export const GITHUB_URL = 'https://github.com/with-backed';
export const FAQ_URL =
  'https://with-backed.notion.site/FAQ-df65a5002100406eb6c5211fb8e105cf';
export const BUNNY_IMG_URL_MAP = {
  ethereum: '/logos/backed-bunny.png',
  rinkeby: '/logos/backed-bunny.png',
  optimism: '/logos/opbunny.png',
  polygon: '/logos/pbunny.png',
};

export const COMMUNITY_NFT_CONTRACT_ADDRESS =
  '0x7887bad2a088027dabce45c81229092a4112f622';
