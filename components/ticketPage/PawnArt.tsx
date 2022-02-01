import React, { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { getNFTInfo, GetNFTInfoResponse } from 'lib/getNFTInfo';
import { Media } from 'components/Media';
import { ERC721 } from 'types/generated/abis';
import { jsonRpcERC721Contract } from 'lib/contracts';
import { Fallback } from 'components/Media/Fallback';

interface PawnArtProps {
  contract: ERC721;
  tokenId: ethers.BigNumber;
}

export function PawnLoanArt({ tokenId }: Pick<PawnArtProps, 'tokenId'>) {
  const pawnLoansContract = jsonRpcERC721Contract(
    process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT || '',
  );
  return <PawnArt contract={pawnLoansContract} tokenId={tokenId} />;
}

export function PawnTicketArt({ tokenId }: Pick<PawnArtProps, 'tokenId'>) {
  const pawnTicketsContract = jsonRpcERC721Contract(
    process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT || '',
  );
  return <PawnArt contract={pawnTicketsContract} tokenId={tokenId} />;
}

function PawnArt({ contract, tokenId }: PawnArtProps) {
  const [nftInfo, setNFTInfo] = useState<GetNFTInfoResponse | null>(null);

  const load = useCallback(async () => {
    const result = await getNFTInfo({ contract, tokenId });
    setNFTInfo(result);
  }, [contract, tokenId]);

  useEffect(() => {
    load();
  }, [load]);

  if (nftInfo === null) {
    return <Fallback />;
  }

  return <PawnArtLoaded {...nftInfo} />;
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
