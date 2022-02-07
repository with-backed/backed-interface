import React from 'react';
import { render } from '@testing-library/react';
import { CollateralInfo } from 'components/CollateralInfo';
import {
  CollectionStatistics,
  getFakeFloor,
  getFakeItemsAndOwners,
  getFakeVolume,
} from 'lib/nftPort';
import { CollateralSaleInfo } from 'lib/loans/collateralSaleInfo';
import { generateFakeSaleForNFT } from 'lib/nftSalesSubgraph';
import { baseLoan } from 'lib/mockData';

const loan = baseLoan;

describe('CollateralInfo', () => {
  const getCollateralSaleInfo = (): CollateralSaleInfo => {
    const [items, owners] = getFakeItemsAndOwners();
    const floor = getFakeFloor();

    // make sure randomly generated floor and volume are not equal, since this would cause
    // getByText to fail, since this assertion expects exactly one node to have this text
    let volume = getFakeVolume();
    while (volume == floor) {
      volume = getFakeVolume();
    }

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

    return {
      recentSale,
      collectionStats,
    };
  };

  it('renders a Fieldset with a vertical description list with the right labels', () => {
    const collateralSaleInfo = getCollateralSaleInfo();
    const { getByText } = render(
      <CollateralInfo loan={loan} collateralSaleInfo={collateralSaleInfo} />,
    );

    getByText('View on OpenSea');
    getByText("item's last sale");
    getByText(
      `${collateralSaleInfo.recentSale.price} ${collateralSaleInfo.recentSale.paymentToken}`,
    );
    getByText('collection');
    getByText(loan.collateralName);
    getByText('items');
    getByText(collateralSaleInfo.collectionStats.items);
    getByText('floor price');
    getByText(`${collateralSaleInfo.collectionStats.floor} ETH`);
    getByText('owners');
    getByText(collateralSaleInfo.collectionStats.owners);
    getByText('volume');
    getByText(`${collateralSaleInfo.collectionStats.volume} ETH`);
  });
});
