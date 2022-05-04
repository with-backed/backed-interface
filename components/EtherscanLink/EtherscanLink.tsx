import { config } from 'lib/config';
import React, { AnchorHTMLAttributes, FunctionComponent } from 'react';

interface EtherscanLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  path: string;
}
const EtherscanLink: FunctionComponent<EtherscanLinkProps> = ({
  children,
  path,
  ...props
}) => {
  // TODO: will it always be etherscan? maybe polygonscan? need to see if URL formats are always the same.
  const href = `${config.etherscanUrl}/${path}`;
  return (
    <a target="_blank" rel="noreferrer" {...props} href={href}>
      {children}
    </a>
  );
};

interface EtherscanAddressLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  address: string;
}
export const EtherscanAddressLink: FunctionComponent<
  EtherscanAddressLinkProps
> = ({ address, children, ...props }) => {
  return (
    <EtherscanLink path={`/address/${address}`} {...props}>
      {children}
    </EtherscanLink>
  );
};

interface EtherscanTransactionLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  transactionHash: string;
}
export const EtherscanTransactionLink: FunctionComponent<
  EtherscanTransactionLinkProps
> = ({ transactionHash, children, ...props }) => {
  return (
    <EtherscanLink path={`/tx/${transactionHash}`} {...props}>
      {children}
    </EtherscanLink>
  );
};

interface EtherscanTokenLinkProps
  extends AnchorHTMLAttributes<HTMLAnchorElement> {
  contractAddress: string;
  assetId: string;
}
export const EtherscanTokenLink: FunctionComponent<EtherscanTokenLinkProps> = ({
  contractAddress,
  assetId,
  children,
  ...props
}) => {
  return (
    <EtherscanLink path={`/token/${contractAddress}?a=${assetId}`} {...props}>
      {children}
    </EtherscanLink>
  );
};
