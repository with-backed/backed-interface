import { DescriptionList } from 'components/DescriptionList';
import { Fieldset } from 'components/Fieldset';
import { OpenSeaAddressLink } from 'components/OpenSeaLink';
import { LoanInfo } from 'lib/LoanInfoType';
import React, { useMemo } from 'react';

type CollateralInfoProps = {
  loanInfo: LoanInfo;
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
