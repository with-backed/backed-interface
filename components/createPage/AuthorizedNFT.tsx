import { ethers } from 'ethers';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AllowButton } from './CreateTicketForm/CreateTicketForm';
import getNFTInfo, { GetNFTInfoResponse } from 'lib/getNFTInfo';
import { Media } from 'components/Media';
import { jsonRpcERC721Contract } from 'lib/contracts';
import { NFTEntity } from 'lib/eip721Subraph';
import {
  getNftSubraphEntityContractAddress,
  constructEtherscanLinkForNft,
} from 'lib/eip721Subraph';
import styles from './AuthorizedNFT.module.css';

interface AuthorizedNFTProps {
  nft: NFTEntity;
  handleApproved: () => void;
}

export function AuthorizedNFT({ nft, handleApproved }: AuthorizedNFTProps) {
  return (
    <div style={{ marginTop: '20px' }}>
      <NFTMedia
        collateralTokenID={nft.identifier}
        collateralAddress={getNftSubraphEntityContractAddress(nft)}
      />
      <div className={styles.nftInfo}>
        <div className={styles.nftInfoText}>{`#${nft.identifier.toString()} - ${
          nft.registry.name
        }`}</div>
        <div className={styles.nftInfoText}>
          <a
            className={styles.etherscanLink}
            href={constructEtherscanLinkForNft(nft)}
            target="_blank"
            rel="noreferrer">
            View on etherscan
          </a>
        </div>
        <div className={styles.nftInfoText}>
          <b>address: </b>
          {getNftSubraphEntityContractAddress(nft)}
        </div>
        <div className={styles.nftInfoText}>
          <b>nft ID: </b>
          {nft.identifier.toString()}
        </div>
      </div>
      <AllowButton
        collateralAddress={getNftSubraphEntityContractAddress(nft)}
        tokenId={nft.identifier}
        setIsApproved={handleApproved}
      />
    </div>
  );
}

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
