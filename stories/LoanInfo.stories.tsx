import React from 'react';
import { LoanInfo } from 'components/LoanInfo';
import {
  baseLoan,
  events,
  loanWithLenderAccruing,
  saleInfo,
} from 'lib/mockData';

export default {
  title: 'components/LoanInfo',
  component: LoanInfo,
};

const collateralMedia = {
  mediaUrl:
    'https://nftpawnshop.mypinata.cloud/ipfs/QmfBX5znHic5TQ5NE6CEYpVfMNsdASYDRj1dMR7mqQUGuQ',
  mediaMimeType: 'video',
};

export function LoanInfoNoLender() {
  return (
    <LoanInfo loan={baseLoan} events={events} collateralSaleInfo={saleInfo} />
  );
}

export function LoanInfoWithLender() {
  return (
    <LoanInfo
      loan={loanWithLenderAccruing}
      events={events}
      collateralSaleInfo={saleInfo}
    />
  );
}
