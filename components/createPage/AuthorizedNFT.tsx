import { NFTEntity } from 'lib/eip721Subraph';
import {
  getNftSubraphEntityContractAddress,
  constructEtherscanLinkForNft,
} from 'lib/eip721Subraph';
import styles from './AuthorizedNFT.module.css';
import { NFTMedia } from 'components/Media/NFTMedia';
import { AllowNFTSpendButton } from './AllowNFTSpendButton';

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
      <AllowNFTSpendButton
        collateralAddress={getNftSubraphEntityContractAddress(nft)}
        tokenId={nft.identifier}
        setIsApproved={handleApproved}
      />
    </div>
  );
}
