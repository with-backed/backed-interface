import { NFTEntity } from 'lib/eip721Subraph';
import { getNftContractAddress } from 'lib/eip721Subraph';
import styles from './AuthorizedNFT.module.css';
import { NFTMedia } from 'components/Media/NFTMedia';
import { AllowNFTSpendButton } from './AllowNFTSpendButton';
import { EtherscanAddressLink } from 'components/EtherscanLink';

interface AuthorizedNFTProps {
  nft: NFTEntity;
  handleApproved: () => void;
}

export function AuthorizedNFT({ nft, handleApproved }: AuthorizedNFTProps) {
  return (
    <div style={{ marginTop: '20px' }}>
      <NFTMedia
        collateralTokenID={nft.identifier}
        collateralAddress={getNftContractAddress(nft)}
      />
      <div className={styles.nftInfo}>
        <div className={styles.nftInfoText}>{`#${nft.identifier.toString()} - ${
          nft.registry.name
        }`}</div>
        <div className={styles.nftInfoText}>
          <EtherscanAddressLink address={getNftContractAddress(nft)}>
            View on etherscan
          </EtherscanAddressLink>
        </div>
        <div className={styles.nftInfoText}>
          <b>address: </b>
          {getNftContractAddress(nft)}
        </div>
        <div className={styles.nftInfoText}>
          <b>nft ID: </b>
          {nft.identifier.toString()}
        </div>
      </div>
      <AllowNFTSpendButton
        collateralAddress={getNftContractAddress(nft)}
        tokenId={nft.identifier}
        setIsApproved={handleApproved}
      />
    </div>
  );
}
