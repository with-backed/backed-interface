import { DescriptionList } from 'components/DescriptionList';
import { Fieldset } from 'components/Fieldset';
import { OpenSeaAddressLink } from 'components/OpenSeaLink';
import { Loan } from 'lib/types/Loan';
import React, { useMemo } from 'react';

type CollateralInfoProps = {
  loanInfo: Loan;
};

export const CollateralInfo = ({ loanInfo }: CollateralInfoProps) => {
  const tokenId = useMemo(
    () => loanInfo.collateralTokenId.toNumber(),
    [loanInfo.collateralTokenId],
  );

  return (
    <Fieldset legend="🖼 Collateral">
      <DescriptionList>
        <dt>#{tokenId}</dt>
        <dd>
          <OpenSeaAddressLink
            contractAddress={loanInfo.collateralContractAddress}
            assetId={tokenId}>
            View on OpenSea
          </OpenSeaAddressLink>
        </dd>
      </DescriptionList>
    </Fieldset>
  );
};
