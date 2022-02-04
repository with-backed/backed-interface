import React from 'react';
import { render } from '@testing-library/react';
import { CollateralInfo } from 'components/CollateralInfo';
import {
  getFakeFloor,
  getFakeItemsAndOwners,
  getFakeVolume,
} from 'lib/nftPort';
import { CollateralSaleInfo } from 'lib/loans/collateralSaleInfo';
import { generateFakeSaleForNFT } from 'lib/nftSalesSubgraph';
import { baseLoan } from 'lib/mockData';

const loan = baseLoan;

const [items, owners] = getFakeItemsAndOwners();
const collectionStats = {
  floor: getFakeFloor(),
  items,
  owners,
  volume: getFakeVolume(),
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
    getByText(`${collectionStats.floor} ETH`);
    getByText('owners');
    getByText(collectionStats.owners);
    getByText('volume');
    getByText(`${collectionStats.volume} ETH`);
  });
});
