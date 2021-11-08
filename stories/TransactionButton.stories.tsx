import React from 'react';

import { TransactionButton } from 'components/ticketPage/TransactionButton';

export default {
  title: 'Components/ticketPage/TransactionButton',
  component: TransactionButton,
};

function handleClick() { };
const txHash = "0xtxHash";

export const TransactionButtonStyles = () => {
  return (
    <>
      <h1>TransactionButton styles</h1>
      <h2>Disabled</h2>
      <TransactionButton
        text="Click me"
        onClick={handleClick}
        txHash=""
        isPending={false}
        disabled
      />
      <h2>Enabled</h2>
      <TransactionButton
        text="Click me"
        onClick={handleClick}
        txHash=""
        isPending={false}
      />
      <h2>Pending</h2>
      <TransactionButton
        text="Click me"
        onClick={handleClick}
        txHash={txHash}
        isPending={true}
      />
    </>
  );
}
