import { DescriptionList } from 'components/DescriptionList';
import React from 'react';
import styles from '../LoanForm.module.css';

type BalanceProps = {
  balance: number;
  loanAmount: number;
  symbol: string;
};

export const Balance = ({ balance, loanAmount, symbol }: BalanceProps) => {
  const insufficientFunds = loanAmount > balance;
  return (
    <DescriptionList orientation="horizontal">
      <dt>Current Balance</dt>
      <dd
        className={
          insufficientFunds ? styles['insufficient-funds'] : undefined
        }>
        {balance.toFixed(2)} {symbol}
      </dd>
    </DescriptionList>
  );
};
