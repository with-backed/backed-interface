import React from 'react';
import { render } from '@testing-library/react';
import { CollateralInfo } from 'components/CollateralInfo';
import { CollateralSaleInfo } from 'lib/loans/collateralSaleInfo';
import { generateFakeSaleForNFT } from 'lib/nftSalesSubgraph';
import { baseLoan } from 'lib/mockData';

const loan = baseLoan;

const floor = 17;
const volume = 2;
const items = 9999;
const owners = 9000;
const collectionStats = {
  floor,
  items,
  owners,
  volume,
};

const recentSale = generateFakeSaleForNFT(
  baseLoan.collateralContractAddress,
  baseLoan.collateralTokenId.toString(),
);

const saleInfo: CollateralSaleInfo = {
  recentSale,
  collectionStats,
};

describe('CollateralInfo', () => {
  it('renders a Fieldset with a vertical description list with the right labels', () => {
    const { getByText } = render(
      <CollateralInfo loan={loan} collateralSaleInfo={saleInfo} />,
    );

    getByText('View on OpenSea');
    getByText("item's last sale");
    getByText(`${recentSale.price} ${recentSale.paymentToken}`);
    getByText('collection');
    getByText(loan.collateralName);
    getByText('items');
    getByText(collectionStats.items);
    getByText('floor price');
    getByText(`${collectionStats.floor.toFixed(4)} ETH`);
    getByText('owners');
    getByText(collectionStats.owners);
    getByText('volume');
    getByText(`${collectionStats.volume.toFixed(2)} ETH`);
  });

  it('renders a Fieldset with a message when there is no recent sale info', () => {
    const { getByText } = render(
      <CollateralInfo
        loan={loan}
        collateralSaleInfo={{
          collectionStats,
          recentSale: null,
        }}
      />,
    );

    getByText('No recent sale info');
  });
});
