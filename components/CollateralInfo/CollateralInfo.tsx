import { DescriptionList } from 'components/DescriptionList';
import { Fieldset } from 'components/Fieldset';
import { OpenSeaAddressLink } from 'components/OpenSeaLink';
import { Loan } from 'types/Loan';
import React, { useMemo } from 'react';
import { CollateralSaleInfo } from 'lib/loans/collateralSaleInfo';

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

        <dt>Last Sale</dt>
        <dd>
          {collateralSaleInfo.recentSale.price}{' '}
          {collateralSaleInfo.recentSale.paymentToken}
        </dd>

        <dt>Collection</dt>
        <dd>{loan.collateralName}</dd>

        <dt>Floor Price</dt>
        <dd>{collateralSaleInfo.floorPrice} ETH</dd>
      </DescriptionList>
    </Fieldset>
  );
};
