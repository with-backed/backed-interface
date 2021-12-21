import { DescriptionList } from 'components/DescriptionList';
import { Fieldset } from 'components/Fieldset';
import { OpenSeaAddressLink } from 'components/OpenSeaLink';
import { Loan } from 'lib/types/Loan';
import React, { useMemo } from 'react';

type CollateralInfoProps = {
  loan: Loan;
};

export const CollateralInfo = ({ loan }: CollateralInfoProps) => {
  const tokenId = useMemo(
    () => loan.collateralTokenId.toNumber(),
    [loan.collateralTokenId],
  );

  return (
    <Fieldset legend="🖼️ Collateral">
      <DescriptionList>
        <dt>#{tokenId}</dt>
        <dd>
          <OpenSeaAddressLink
            contractAddress={loan.collateralContractAddress}
            assetId={tokenId}>
            View on OpenSea
          </OpenSeaAddressLink>
        </dd>
      </DescriptionList>
    </Fieldset>
  );
};
