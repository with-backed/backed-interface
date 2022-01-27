import React from 'react';
import { LoanInfo } from 'components/LoanInfo';
import { baseLoan, loanWithLenderAccruing } from 'lib/mockData';
import { CollateralSaleInfo } from 'lib/loans/collateralSaleInfo';
import { getFakeFloor } from 'lib/nftPort';
import { generateFakeSaleForNFT } from 'lib/nftSalesSubgraph';

export default {
  title: 'components/LoanInfo',
  component: LoanInfo,
};

const saleInfo: CollateralSaleInfo = {
  recentSale: generateFakeSaleForNFT(
    '0x9ec7ff8964afba6d8c43dc340a2e6c6c3156e966',
    '10',
  ),
  floorPrice: getFakeFloor(),
};

export function LoanInfoNoLender() {
  return <LoanInfo loan={baseLoan} collateralSaleInfo={saleInfo} />;
}

export function LoanInfoWithLender() {
  return (
    <LoanInfo loan={loanWithLenderAccruing} collateralSaleInfo={saleInfo} />
  );
}
