import React, { AnchorHTMLAttributes, FunctionComponent } from 'react';

interface EtherscanLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  path: string;
}
const EtherscanLink: FunctionComponent<EtherscanLinkProps> = ({
  children,
  path,
  ...props
}) => {
  const href = `${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/${path}`;
  return (
    <a
      target="_blank"
      rel="noreferrer"
      {...props}
      href={href}
    >
      {children}
    </a>
  )
}

interface EtherscanAddressProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  address: string,
}
export const EtherscanAddressLink: FunctionComponent<EtherscanAddressProps> = ({ address, children, ...props }) => {
  return <EtherscanLink path={`/address/${address}`} {...props}>{children}</EtherscanLink>;
}

interface EtherscanTransactionProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  transactionHash: string,
}
export const EtherscanTransactionLink: FunctionComponent<EtherscanTransactionProps> = ({ transactionHash, children, ...props }) => {
  return <EtherscanLink path={`/tx/${transactionHash}`} {...props}>{children}</EtherscanLink>;
}

