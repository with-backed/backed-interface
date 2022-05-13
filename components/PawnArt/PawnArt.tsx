import React, { useMemo } from 'react';
import { ethers } from 'ethers';
import { GetNFTInfoResponse } from 'lib/getNFTInfo';
import { Media } from 'components/Media';
import { contractDirectory } from 'lib/contracts';
import { Fallback } from 'components/Media/Fallback';
import { useTokenMetadata } from 'hooks/useTokenMetadata';
import { useConfig } from 'hooks/useConfig';
import { SupportedNetwork } from 'lib/config';

interface PawnArtProps {
  collateralContractAddress: string;
  tokenID: ethers.BigNumber;
}

export const PawnLoanArt = React.memo(
  ({ tokenID }: Pick<PawnArtProps, 'tokenID'>) => {
    const { network } = useConfig();
    return (
      <PawnArt
        collateralContractAddress={
          contractDirectory[network as SupportedNetwork].lendTicket
        }
        tokenID={tokenID}
      />
    );
  },
);
PawnLoanArt.displayName = 'PawnLoanArt';

export const PawnTicketArt = React.memo(
  ({ tokenID }: Pick<PawnArtProps, 'tokenID'>) => {
    const { network } = useConfig();
    return (
      <PawnArt
        collateralContractAddress={
          contractDirectory[network as SupportedNetwork].borrowTicket
        }
        tokenID={tokenID}
      />
    );
  },
);
PawnTicketArt.displayName = 'PawnTicketArt';

function PawnArt({ collateralContractAddress, tokenID }: PawnArtProps) {
  const tokenSpec = useMemo(
    () => ({
      collateralContractAddress,
      collateralTokenId: tokenID,
    }),
    [collateralContractAddress, tokenID],
  );
  const { isLoading, metadata } = useTokenMetadata(tokenSpec);

  if (isLoading || !metadata) {
    return <Fallback />;
  }

  return <PawnArtLoaded {...metadata} />;
}

function PawnArtLoaded(nftInfo: GetNFTInfoResponse) {
  return (
    <Media
      media={nftInfo.mediaUrl}
      mediaMimeType={nftInfo.mediaMimeType}
      autoPlay={false}
    />
  );
}
