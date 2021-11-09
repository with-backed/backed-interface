import React, { useCallback, useEffect, useState } from 'react';
import { ethers } from 'ethers';
import getNFTInfo, { GetNFTInfoResponse } from 'lib/getNFTInfo';
import { Media } from 'components/Media';
import { ERC721 } from 'abis/types';
import { jsonRpcERC721Contract } from 'lib/contracts';

const pawnTicketsContract = jsonRpcERC721Contract(process.env.NEXT_PUBLIC_BORROW_TICKET_CONTRACT);

const pawnLoansContract = jsonRpcERC721Contract(process.env.NEXT_PUBLIC_LEND_TICKET_CONTRACT);

export function PawnLoanArt({ tokenId }) {
  return <PawnArt contract={pawnLoansContract} tokenId={tokenId} />;
}

interface PawnArtProps {
  contract: ERC721
  tokenId: ethers.BigNumber
}

export function PawnTicketArt({ tokenId }) {
  return <PawnArt contract={pawnTicketsContract} tokenId={tokenId} />;
}

function PawnArt({ contract, tokenId }: PawnArtProps) {
  const [nftInfo, setNFTInfo] = useState<GetNFTInfoResponse>(null);

  const load = useCallback(async () => {
    const result = await getNFTInfo({ contract, tokenId });
    setNFTInfo(result);
  }, [contract, tokenId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="pawn-art">
      {Boolean(nftInfo) && (
        <div>
          <PawnArtLoaded {...nftInfo} />
        </div>
      )}
    </div>
  );
}

function PawnArtLoaded(nftInfo: GetNFTInfoResponse) {
  return (
    <div>
      <div className="pawn-art nfte__media">
        <Media
          media={nftInfo.mediaUrl}
          mediaMimeType={nftInfo.mediaMimeType}
          autoPlay={false}
        />
      </div>
    </div>
  );
}
