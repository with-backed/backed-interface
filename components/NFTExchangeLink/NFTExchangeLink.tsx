import { useConfig } from 'hooks/useConfig';
import React, { AnchorHTMLAttributes, FunctionComponent } from 'react';

const ADDRESS_LINK_TEXT: { [key: string]: string } = {
  rinkeby: 'View on OpenSea',
  ethereum: 'View on OpenSea',
  optimism: 'View on Quixotic',
  polygon: 'View on OpenSea',
};

const ADDRESS_LINK_PATH_PREFIX: { [key: string]: string } = {
  rinkeby: 'assets',
  ethereum: 'assets',
  optimism: 'asset',
  polygon: 'assets/matic',
};

interface ExchangeLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  path: string;
}
const NFTExchangeLink: FunctionComponent<ExchangeLinkProps> = ({
  children,
  path,
  ...props
}) => {
  const { openSeaUrl } = useConfig();
  const href = `${openSeaUrl}/${path}`;
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
  const { network } = useConfig();
  return (
    <NFTExchangeLink
      path={`/${ADDRESS_LINK_PATH_PREFIX[network]}/${contractAddress}/${assetId}`}
      {...props}>
      {ADDRESS_LINK_TEXT[network]}
    </NFTExchangeLink>
  );
};
