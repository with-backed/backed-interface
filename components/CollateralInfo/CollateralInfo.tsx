import { DescriptionList } from 'components/DescriptionList';
import { Fieldset } from 'components/Fieldset';
import { OpenSeaAddressLink } from 'components/OpenSeaLink';
import { Loan } from 'types/Loan';
import React, { useMemo } from 'react';
import { CollateralSaleInfo } from 'lib/loans/collateralSaleInfo';
import styles from './CollateralInfo.module.css';

type CollateralInfoProps = {
  loan: Loan;
  collateralSaleInfo: CollateralSaleInfo;
};

export const CollateralInfo = ({
  loan,
  collateralSaleInfo,
}: CollateralInfoProps) => {
  const tokenId = useMemo(
    () => loan.collateralTokenId.toNumber(),
    [loan.collateralTokenId],
  );

  return (
    <Fieldset legend="🖼️ Collateral">
      <DescriptionList>
        <dd>#{tokenId}</dd>
        <dd>
          <OpenSeaAddressLink
            contractAddress={loan.collateralContractAddress}
            assetId={tokenId}>
            View on OpenSea
          </OpenSeaAddressLink>
        </dd>

        <dt>ITEM&apos;S LAST SALE</dt>
        <dd>
          {collateralSaleInfo.recentSale.price}{' '}
          {collateralSaleInfo.recentSale.paymentToken}
        </dd>

        <dt>COLLECTION</dt>
        <dd>{loan.collateralName}</dd>

        <div className={styles.collectionInfoElement}>
          <dt>ITEMS</dt>
          <dd>{collateralSaleInfo.collectionStats.items}</dd>
        </div>

        <div className={styles.collectionInfoElement}>
          <dt>FLOOR PRICE</dt>
          <dd>{collateralSaleInfo.collectionStats.floor} ETH</dd>
        </div>

        <div className={styles.collectionInfoElement}>
          <dt>OWNERS</dt>
          <dd>{collateralSaleInfo.collectionStats.owners}</dd>
        </div>

        <div className={styles.collectionInfoElement}>
          <dt>VOLUME</dt>
          <dd>{collateralSaleInfo.collectionStats.volume} ETH</dd>
        </div>
      </DescriptionList>
    </Fieldset>
  );
};
