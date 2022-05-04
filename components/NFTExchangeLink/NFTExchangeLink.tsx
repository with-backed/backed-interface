import { config } from 'lib/config';
import React, { AnchorHTMLAttributes, FunctionComponent } from 'react';

const ADDRESS_LINK_TEXT = (() => {
  if (config.onOptimismMainnet) {
    return 'View on Quixotic';
  }

  return 'View on OpenSea';
})();

const ADDRESS_LINK_PATH_PREFIX = (() => {
  if (config.onOptimismMainnet) {
    return 'asset';
  }

  return 'assets';
})();

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
      path={`/${ADDRESS_LINK_PATH_PREFIX}/${contractAddress}/${assetId}`}
      {...props}>
      {ADDRESS_LINK_TEXT}
    </NFTExchangeLink>
  );
};
