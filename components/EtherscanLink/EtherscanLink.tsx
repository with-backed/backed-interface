import React, { AnchorHTMLAttributes, FunctionComponent } from 'react';

interface EtherscanLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  address?: string,
  transactionHash?: string,
}
const EtherscanLink: FunctionComponent<EtherscanLinkProps> = ({
  children,
  address,
  transactionHash,
  ...props
}) => {
  const kind = address ? 'address' : 'tx';
  const href = `${process.env.NEXT_PUBLIC_ETHERSCAN_URL}/${kind}/${address || transactionHash}`;
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
  return <EtherscanLink address={address} {...props}>{children}</EtherscanLink>;
}

interface EtherscanTransactionProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  transactionHash: string,
}
export const EtherscanTransactionLink: FunctionComponent<EtherscanTransactionProps> = ({ transactionHash, children, ...props }) => {
  return <EtherscanLink transactionHash={transactionHash} {...props}>{children}</EtherscanLink>;
}
