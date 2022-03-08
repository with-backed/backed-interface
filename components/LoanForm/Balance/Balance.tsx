import { DescriptionList } from 'components/DescriptionList';
import React from 'react';

type BalanceProps = {
  balance: number;
  symbol: string;
};

export const Balance = ({ balance, symbol }: BalanceProps) => {
  return (
    <DescriptionList orientation="horizontal">
      <dt>Current Balance</dt>
      <dd>
        {balance.toFixed(2)} {symbol}
      </dd>
    </DescriptionList>
  );
};
