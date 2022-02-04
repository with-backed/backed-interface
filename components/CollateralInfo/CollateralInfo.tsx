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

        <dt>Item&apos;s Last Sale</dt>
        <dd>
          {collateralSaleInfo.recentSale.price}{' '}
          {collateralSaleInfo.recentSale.paymentToken}
        </dd>

        <dt>Collection</dt>
        <dd>{loan.collateralName}</dd>

        <div className={styles.collectionInfoGrid}>
          <div>
            <dt>Items</dt>
            <dd>{collateralSaleInfo.collectionStats.items}</dd>
          </div>

          <div>
            <dt>Floor Price</dt>
            <dd>{collateralSaleInfo.collectionStats.floor} ETH</dd>
          </div>

          <div>
            <dt>Owners</dt>
            <dd>{collateralSaleInfo.collectionStats.owners}</dd>
          </div>

          <div>
            <dt>Volume</dt>
            <dd>{collateralSaleInfo.collectionStats.volume} ETH</dd>
          </div>
        </div>
      </DescriptionList>
    </Fieldset>
  );
};
