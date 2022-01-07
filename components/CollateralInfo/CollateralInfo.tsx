import { DescriptionList } from 'components/DescriptionList';
import { Fieldset } from 'components/Fieldset';
import { OpenSeaAddressLink } from 'components/OpenSeaLink';
import { Loan } from 'types/Loan';
import React, { useMemo } from 'react';

type CollateralInfoProps = {
  loan: Loan;
};

export const CollateralInfo = ({ loan }: CollateralInfoProps) => {
  const tokenId = useMemo(
    () => loan.collateralTokenId.toNumber(),
    [loan.collateralTokenId],
  );
  console.log(loan);
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
        <dt>Collection</dt>
        <dd>{loan.collateralName}</dd>
      </DescriptionList>
    </Fieldset>
  );
};
