import React, { AnchorHTMLAttributes, FunctionComponent } from 'react';

interface OpenSeaLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  path: string;
}
const OpenSeaLink: FunctionComponent<OpenSeaLinkProps> = ({
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

interface OpenSeaNFTLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  contractAddress: string;
  assetId: string;
}
export const OpenSeaAddressLink: FunctionComponent<OpenSeaNFTLinkProps> = ({
  assetId,
  contractAddress,
  children,
  ...props
}) => {
  return (
    <OpenSeaLink path={`/assets/${contractAddress}/${assetId}`} {...props}>
      {children}
    </OpenSeaLink>
  );
};
