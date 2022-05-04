import React, { AnchorHTMLAttributes, FunctionComponent } from 'react';

const ADDRESS_LINK_TEXT: { [key: string]: string } = {
  rinkeby: 'View on OpenSea',
  mainnet: 'View on OpenSea',
  optimism: 'View on Quixotic',
};

const ADDRESS_LINK_PATH_PREFIX: { [key: string]: string } = {
  rinkeby: 'assets',
  mainnet: 'assets',
  optimism: 'asset',
};

interface ExchangeLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  path: string;
}
const NFTExchangeLink: FunctionComponent<ExchangeLinkProps> = ({
  children,
  path,
  ...props
}) => {
  const href = `${process.env.NEXT_PUBLIC_OPENSEA_URL}/${path}`;
  return (
    <a target="_blank" rel="noreferrer" {...props} href={href}>
      {children}
    </a>
  );
};

interface NFTExchangeLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  contractAddress: string;
  assetId: string;
}
export const NFTExchangeAddressLink: FunctionComponent<
  NFTExchangeLinkProps
> = ({ assetId, contractAddress, ...props }) => {
  return (
    <NFTExchangeLink
      path={`/${
        ADDRESS_LINK_PATH_PREFIX[process.env.NEXT_PUBLIC_ENV!]
      }/${contractAddress}/${assetId}`}
      {...props}>
      {ADDRESS_LINK_TEXT[process.env.NEXT_PUBLIC_ENV!]}
    </NFTExchangeLink>
  );
};
