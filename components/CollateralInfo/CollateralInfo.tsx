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

  if (!collateralSaleInfo) {
    return (
      <Fieldset legend="🖼️ Collateral">
        <dd>#{tokenId}</dd>
        <dd>
          <OpenSeaAddressLink
            contractAddress={loan.collateralContractAddress}
            assetId={tokenId}>
            View on OpenSea
          </OpenSeaAddressLink>
        </dd>
        <dt className={styles.label}>item&apos;s last sale</dt>
        <dd>No recent sale info</dd>
      </Fieldset>
    );
  }

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

        <dt className={styles.label}>item&apos;s last sale</dt>
        <dd>
          {collateralSaleInfo.recentSale.price}{' '}
          {collateralSaleInfo.recentSale.paymentToken}
        </dd>

        <dt className={styles.label}>collection</dt>
        <dd>{loan.collateralName}</dd>

        <div className={styles.collectionInfoElement}>
          <dt className={styles.label}>items</dt>
          <dd>{collateralSaleInfo.collectionStats.items}</dd>
        </div>

        <div className={styles.collectionInfoElement}>
          <dt className={styles.label}>floor price</dt>
          <dd>{collateralSaleInfo.collectionStats.floor} ETH</dd>
        </div>

        <div className={styles.collectionInfoElement}>
          <dt className={styles.label}>owners</dt>
          <dd>{collateralSaleInfo.collectionStats.owners}</dd>
        </div>

        <div className={styles.collectionInfoElement}>
          <dt className={styles.label}>volume</dt>
          <dd>{collateralSaleInfo.collectionStats.volume} ETH</dd>
        </div>
      </DescriptionList>
    </Fieldset>
  );
};
