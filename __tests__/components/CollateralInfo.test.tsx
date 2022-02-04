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
    const { getByText, container } = render(
      <CollateralInfo loan={loan} collateralSaleInfo={saleInfo} />,
    );

    expect(container.querySelector('fieldset')).not.toBeNull();
    expect(container.querySelector('.vertical')).not.toBeNull();
    getByText('View on OpenSea');
    getByText("ITEM'S LAST SALE");
    getByText('COLLECTION');
    getByText('ITEMS');
    getByText('FLOOR PRICE');
    getByText('OWNERS');
    getByText('VOLUME');
  });
});
