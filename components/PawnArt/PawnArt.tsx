import React, { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { GetNFTInfoResponse } from 'lib/getNFTInfo';
import { Media } from 'components/Media';
import { ERC721 } from 'types/generated/abis';
import { contractDirectory, jsonRpcERC721Contract } from 'lib/contracts';
import { Fallback } from 'components/Media/Fallback';
import { useTokenMetadata } from 'hooks/useTokenMetadata';

interface PawnArtProps {
  contract: ERC721;
  tokenID: ethers.BigNumber;
}

export const PawnLoanArt = React.memo(
  ({ tokenID }: Pick<PawnArtProps, 'tokenID'>) => {
    const pawnLoansContract = jsonRpcERC721Contract(
      contractDirectory.lendTicket,
    );
    return <PawnArt contract={pawnLoansContract} tokenID={tokenID} />;
  },
);
PawnLoanArt.displayName = 'PawnLoanArt';

export const PawnTicketArt = React.memo(
  ({ tokenID }: Pick<PawnArtProps, 'tokenID'>) => {
    const pawnTicketsContract = jsonRpcERC721Contract(
      contractDirectory.borrowTicket,
    );
    return <PawnArt contract={pawnTicketsContract} tokenID={tokenID} />;
  },
);
PawnTicketArt.displayName = 'PawnTicketArt';

function PawnArt({ contract, tokenID }: PawnArtProps) {
  const [tokenURI, setTokenURI] = useState('');
  const tokenSpec = useMemo(
    () => ({
      tokenURI,
      tokenID,
    }),
    [tokenID, tokenURI],
  );
  const { isLoading, metadata } = useTokenMetadata(tokenSpec);

  useEffect(() => {
    contract.tokenURI(tokenID).then(setTokenURI);
  }, [contract, tokenID]);

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
