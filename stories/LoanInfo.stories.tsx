import React from 'react';
import { LoanInfo } from 'components/LoanInfo';
import { baseLoan, loanWithLenderAccruing } from 'lib/mockData';
import { CollateralSaleInfo } from 'lib/loans/collateralSaleInfo';
import {
  getFakeFloor,
  getFakeItemsAndOwners,
  getFakeVolume,
} from 'lib/nftCollectionStats/mockData';

export default {
  title: 'components/LoanInfo',
  component: LoanInfo,
};

const [items, owners] = getFakeItemsAndOwners();
const collectionStats = {
  floor: getFakeFloor(),
  items,
  owners,
  volume: getFakeVolume(),
};

const saleInfo: CollateralSaleInfo = {
  recentSale: null,
  collectionStats,
};

export function LoanInfoNoLender() {
  return <LoanInfo loan={baseLoan} collateralSaleInfo={saleInfo} />;
}

export function LoanInfoWithLender() {
  return (
    <LoanInfo loan={loanWithLenderAccruing} collateralSaleInfo={saleInfo} />
  );
}
