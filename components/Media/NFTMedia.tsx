import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import getNFTInfo, { GetNFTInfoResponse } from 'lib/getNFTInfo';
import { Media } from 'components/Media';
import { jsonRpcERC721Contract } from 'lib/contracts';

interface NFTMediaProps {
  collateralAddress: string;
  collateralTokenID: ethers.BigNumber;
}

export function NFTMedia({
  collateralAddress,
  collateralTokenID,
}: NFTMediaProps) {
  const [nftInfo, setNFTInfo] = useState<GetNFTInfoResponse | null>(null);

  const load = useCallback(async () => {
    const contract = jsonRpcERC721Contract(collateralAddress);

    const result = await getNFTInfo({
      contract,
      tokenId: collateralTokenID,
      forceImage: true,
    });
    setNFTInfo(result);
  }, [collateralAddress, collateralTokenID]);

  useEffect(() => {
    load();
  }, [load]);

  if (!nftInfo) {
    return null;
  }

  return (
    <Media
      media={nftInfo.mediaUrl}
      mediaMimeType={nftInfo.mediaMimeType}
      autoPlay={false}
    />
  );
}
