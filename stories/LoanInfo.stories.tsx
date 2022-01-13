import React from 'react';
import { LoanInfo } from 'components/LoanInfo';
import { baseLoan, loanWithLenderAccruing, saleInfo } from 'lib/mockData';

export default {
  title: 'components/LoanInfo',
  component: LoanInfo,
};

export function LoanInfoNoLender() {
  return <LoanInfo loan={baseLoan} collateralSaleInfo={saleInfo} />;
}

export function LoanInfoWithLender() {
  return (
    <LoanInfo loan={loanWithLenderAccruing} collateralSaleInfo={saleInfo} />
  );
}
