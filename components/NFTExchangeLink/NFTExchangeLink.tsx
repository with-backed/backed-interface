import { useConfig } from 'hooks/useConfig';
import { configs, SupportedNetwork } from 'lib/config';
import React, { AnchorHTMLAttributes, FunctionComponent, useMemo } from 'react';

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
  forceNetwork?: SupportedNetwork;
}
const NFTExchangeLink: FunctionComponent<ExchangeLinkProps> = ({
  children,
  forceNetwork,
  path,
  ...props
}) => {
  const { openSeaUrl } = useConfig();
  const url = useMemo(() => {
    if (forceNetwork) {
      return configs[forceNetwork].openSeaUrl;
    }
    return openSeaUrl;
  }, [forceNetwork, openSeaUrl]);
  const href = `${url}/${path}`;
  return (
    <a target="_blank" rel="noreferrer" {...props} href={href}>
      {children}
    </a>
  );
};

interface NFTExchangeLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  contractAddress: string;
  assetId: string;
  forceNetwork?: SupportedNetwork;
}
export const NFTExchangeAddressLink: FunctionComponent<
  NFTExchangeLinkProps
> = ({ assetId, contractAddress, forceNetwork, ...props }) => {
  const { network } = useConfig();
  return (
    <NFTExchangeLink
      path={`/${
        ADDRESS_LINK_PATH_PREFIX[forceNetwork || network]
      }/${contractAddress}/${assetId}`}
      forceNetwork={forceNetwork}
      {...props}>
      {ADDRESS_LINK_TEXT[forceNetwork || network]}
    </NFTExchangeLink>
  );
};
